import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FlowtipProgram } from "../target/types/flowtip_program";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("flowtip-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FlowtipProgram as Program<FlowtipProgram>;
  
  // Test accounts
  let usdcMint: PublicKey;
  let creator: Keypair;
  let donor: Keypair;
  let creatorProfile: PublicKey;
  let creatorUsdcAta: PublicKey;
  let donorUsdcAta: PublicKey;
  
  const creatorHandle = "testcreator";
  const tipAmount = new anchor.BN(1000000); // 1 USDC (6 decimals)

  before(async () => {
    // Initialize test accounts
    creator = Keypair.generate();
    donor = Keypair.generate();

    // Airdrop SOL to accounts
    await provider.connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(donor.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create USDC mint (simulating USDC)
    usdcMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6 // USDC has 6 decimal places
    );

    // Find creator profile PDA
    [creatorProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator_profile"), Buffer.from(creatorHandle)],
      program.programId
    );

    console.log("Test setup complete");
    console.log("Creator:", creator.publicKey.toString());
    console.log("Donor:", donor.publicKey.toString());
    console.log("USDC Mint:", usdcMint.toString());
    console.log("Creator Profile PDA:", creatorProfile.toString());
  });

  it("Initializes a creator profile", async () => {
    // Find the creator's USDC ATA address
    const [creatorUsdcAtaAddress] = PublicKey.findProgramAddressSync(
      [
        creatorProfile.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        usdcMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const [, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator_profile"), Buffer.from(creatorHandle)],
      program.programId
    );

    const tx = await program.methods
      .initializeCreatorProfile(creatorHandle, bump)
      .accounts({
        creator: creator.publicKey,
        creatorProfile: creatorProfile,
        creatorUsdcAta: creatorUsdcAtaAddress,
        usdcMint: usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([creator])
      .rpc();

    console.log("Initialize creator profile tx:", tx);

    // Fetch the created account
    const creatorProfileAccount = await program.account.creatorProfile.fetch(creatorProfile);
    
    expect(creatorProfileAccount.owner.toString()).to.equal(creator.publicKey.toString());
    expect(creatorProfileAccount.handle).to.equal(creatorHandle);
    expect(creatorProfileAccount.totalTipsReceived.toString()).to.equal("0");
    expect(creatorProfileAccount.tipsCount.toString()).to.equal("0");
    expect(creatorProfileAccount.bump).to.equal(bump);

    creatorUsdcAta = creatorUsdcAtaAddress;
  });

  it("Sends a tip to the creator", async () => {
    // Create donor's USDC token account and mint some USDC
    const donorUsdcAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      donor,
      usdcMint,
      donor.publicKey
    );
    donorUsdcAta = donorUsdcAccount.address;

    // Mint USDC to donor
    await mintTo(
      provider.connection,
      creator, // mint authority
      usdcMint,
      donorUsdcAta,
      creator,
      tipAmount.toNumber() * 10 // Give donor 10 USDC
    );

    // Get initial balances
    const initialDonorBalance = await getAccount(provider.connection, donorUsdcAta);
    const initialCreatorBalance = await getAccount(provider.connection, creatorUsdcAta);

    console.log("Initial donor balance:", initialDonorBalance.amount.toString());
    console.log("Initial creator balance:", initialCreatorBalance.amount.toString());

    // Send tip
    const tx = await program.methods
      .sendTip(tipAmount)
      .accounts({
        donor: donor.publicKey,
        donorUsdcAta: donorUsdcAta,
        creatorProfile: creatorProfile,
        creatorUsdcAta: creatorUsdcAta,
        usdcMint: usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor])
      .rpc();

    console.log("Send tip tx:", tx);

    // Check balances after tip
    const finalDonorBalance = await getAccount(provider.connection, donorUsdcAta);
    const finalCreatorBalance = await getAccount(provider.connection, creatorUsdcAta);

    console.log("Final donor balance:", finalDonorBalance.amount.toString());
    console.log("Final creator balance:", finalCreatorBalance.amount.toString());

    // Verify the transfer
    expect(
      Number(finalDonorBalance.amount) === Number(initialDonorBalance.amount) - tipAmount.toNumber()
    ).to.be.true;
    expect(
      Number(finalCreatorBalance.amount) === Number(initialCreatorBalance.amount) + tipAmount.toNumber()
    ).to.be.true;

    // Check creator profile was updated
    const updatedCreatorProfile = await program.account.creatorProfile.fetch(creatorProfile);
    expect(updatedCreatorProfile.totalTipsReceived.toString()).to.equal(tipAmount.toString());
    expect(updatedCreatorProfile.tipsCount.toString()).to.equal("1");
  });

  it("Handles multiple tips correctly", async () => {
    const secondTipAmount = new anchor.BN(500000); // 0.5 USDC

    // Send second tip
    const tx = await program.methods
      .sendTip(secondTipAmount)
      .accounts({
        donor: donor.publicKey,
        donorUsdcAta: donorUsdcAta,
        creatorProfile: creatorProfile,
        creatorUsdcAta: creatorUsdcAta,
        usdcMint: usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor])
      .rpc();

    console.log("Second tip tx:", tx);

    // Check creator profile stats
    const updatedCreatorProfile = await program.account.creatorProfile.fetch(creatorProfile);
    const expectedTotal = tipAmount.add(secondTipAmount);
    
    expect(updatedCreatorProfile.totalTipsReceived.toString()).to.equal(expectedTotal.toString());
    expect(updatedCreatorProfile.tipsCount.toString()).to.equal("2");
  });

  it("Fails with invalid tip amount", async () => {
    try {
      await program.methods
        .sendTip(new anchor.BN(0))
        .accounts({
          donor: donor.publicKey,
          donorUsdcAta: donorUsdcAta,
          creatorProfile: creatorProfile,
          creatorUsdcAta: creatorUsdcAta,
          usdcMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor])
        .rpc();
      
      // Should not reach here
      expect.fail("Expected transaction to fail with invalid amount");
    } catch (error) {
      expect(error.toString()).to.include("InvalidAmount");
    }
  });
}); 