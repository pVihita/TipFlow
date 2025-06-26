use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("2ZxirQjK8vJ5yvGWbX3XGEybE6wBiFFCBzPwJc9V3fhm");

#[program]
pub mod flowtip_program {
    use super::*;

    /// Initialize a creator profile with a unique handle
    pub fn initialize_creator_profile(
        ctx: Context<InitializeCreatorProfile>,
        handle: String,
    ) -> Result<()> {
        require!(handle.len() <= 32, FlowTipError::HandleTooLong);
        require!(handle.len() > 0, FlowTipError::HandleEmpty);
        
        let creator_profile = &mut ctx.accounts.creator_profile;
        creator_profile.owner = ctx.accounts.creator.key();
        creator_profile.handle = handle;
        creator_profile.usdc_ata = ctx.accounts.creator_usdc_ata.key();
        creator_profile.bump = ctx.bumps.creator_profile;
        creator_profile.total_tips_received = 0;
        creator_profile.tips_count = 0;

        msg!("Creator profile initialized for handle: {}", creator_profile.handle);
        Ok(())
    }

    /// Send a tip to a creator
    pub fn send_tip(ctx: Context<SendTip>, amount: u64) -> Result<()> {
        require!(amount > 0, FlowTipError::InvalidAmount);
        
        let creator_profile = &mut ctx.accounts.creator_profile;
        
        // Transfer USDC from donor to creator
        let transfer_instruction = Transfer {
            from: ctx.accounts.donor_usdc_ata.to_account_info(),
            to: ctx.accounts.creator_usdc_ata.to_account_info(),
            authority: ctx.accounts.donor.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        // Update creator profile stats
        creator_profile.total_tips_received = creator_profile
            .total_tips_received
            .checked_add(amount)
            .ok_or(FlowTipError::MathOverflow)?;
        creator_profile.tips_count = creator_profile
            .tips_count
            .checked_add(1)
            .ok_or(FlowTipError::MathOverflow)?;

        emit!(TipSent {
            creator: creator_profile.owner,
            donor: ctx.accounts.donor.key(),
            amount,
            handle: creator_profile.handle.clone(),
        });

        msg!("Tip of {} USDC sent to creator: {}", amount, creator_profile.handle);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(handle: String)]
pub struct InitializeCreatorProfile<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = CreatorProfile::SPACE,
        seeds = [b"creator_profile", handle.as_bytes()],
        bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = usdc_mint,
        associated_token::authority = creator_profile
    )]
    pub creator_usdc_ata: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SendTip<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = donor
    )]
    pub donor_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"creator_profile", creator_profile.handle.as_bytes()],
        bump = creator_profile.bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        mut,
        address = creator_profile.usdc_ata
    )]
    pub creator_usdc_ata: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CreatorProfile {
    pub owner: Pubkey,          // 32 bytes
    pub handle: String,         // 4 + 32 bytes (max 32 chars)
    pub usdc_ata: Pubkey,      // 32 bytes
    pub bump: u8,              // 1 byte
    pub total_tips_received: u64, // 8 bytes
    pub tips_count: u64,       // 8 bytes
}

impl CreatorProfile {
    pub const SPACE: usize = 8 + 32 + 4 + 32 + 32 + 1 + 8 + 8; // 125 bytes
}

#[event]
pub struct TipSent {
    pub creator: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
    pub handle: String,
}

#[error_code]
pub enum FlowTipError {
    #[msg("Handle is too long (max 32 characters)")]
    HandleTooLong,
    #[msg("Handle cannot be empty")]
    HandleEmpty,
    #[msg("Creator profile already exists")]
    CreatorAlreadyInitialized,
    #[msg("Invalid tip amount (must be greater than 0)")]
    InvalidAmount,
    #[msg("Math overflow occurred")]
    MathOverflow,
} 