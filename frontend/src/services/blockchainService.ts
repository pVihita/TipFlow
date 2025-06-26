import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount
} from '@solana/spl-token';
import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import * as bs58 from 'bs58';

// Program ID for our deployed smart contract
const PROGRAM_ID = new PublicKey("2ZxirQjK8vJ5yvGWbX3XGEybE6wBiFFCBzPwJc9V3fhm");

// USDC Mint Address on Devnet
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Connection to Solana devnet - Using Helius RPC from environment
const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Log RPC configuration for debugging
console.log('🔗 Blockchain Service Configuration:');
console.log('- RPC URL:', RPC_URL);
console.log('- Using Helius:', RPC_URL.includes('helius'));
console.log('- Network:', RPC_URL.includes('mainnet') ? 'mainnet' : 'devnet');

// Relayer endpoint for gasless transactions
const RELAYER_ENDPOINT = import.meta.env.VITE_RELAYER_ENDPOINT || 'http://localhost:3000/api/send-gasless-tx';

export interface BlockchainProfile {
  publicKey: string;
  solBalance: number;
  usdcBalance: number;
  usdcTokenAccount?: string;
}

export interface TipTransaction {
  id: string;
  signature: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasless: boolean;
}

export interface CreatorProfileOnChain {
  owner: PublicKey;
  handle: string;
  usdcAta: PublicKey;
  totalTipsReceived: number;
  tipsCount: number;
  bump: number;
}

class BlockchainService {
  private connection: Connection;
  
  constructor() {
    this.connection = connection;
  }

  // Get user's REAL blockchain profile using Dynamic SDK
  async getProfile(walletAddress: string): Promise<BlockchainProfile> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      console.log('🔄 Fetching REAL blockchain profile for:', walletAddress);
      
      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      
      // Get REAL USDC balance
      let usdcBalance = 0;
      let usdcTokenAccount: string | undefined;
      
      try {
        const usdcAta = await getAssociatedTokenAddress(
          USDC_MINT_DEVNET,
          publicKey
        );
        
        const tokenAccount = await getAccount(
          this.connection,
          usdcAta
        );
        
        usdcBalance = Number(tokenAccount.amount) / 1e6; // USDC has 6 decimals
        usdcTokenAccount = usdcAta.toString();
        
        console.log('✅ REAL USDC balance found:', usdcBalance, 'USDC');
      } catch (error) {
        console.log('⚠️ USDC token account not found for user, balance is 0');
      }
      
      const profile = {
        publicKey: walletAddress,
        solBalance: solBalance / LAMPORTS_PER_SOL,
        usdcBalance,
        usdcTokenAccount
      };

      console.log('✅ REAL blockchain profile fetched:', profile);
      return profile;
    } catch (error) {
      console.error('Failed to get REAL blockchain profile:', error);
      throw new Error('Failed to fetch blockchain profile');
    }
  }

  // Send REAL gasless USDC tip using Dynamic SDK (following Dynamic's documentation)
  async sendTip(
    wallet: any,
    creatorWalletAddress: string,
    amount: number
  ): Promise<TipTransaction> {
    try {
      if (!isSolanaWallet(wallet)) {
        throw new Error('Solana wallet required for USDC tips');
      }

      console.log('🚀 INITIATING REAL GASLESS USDC TIP (Dynamic SDK Pattern):');
      console.log('From:', wallet.address);
      console.log('To:', creatorWalletAddress);
      console.log('Amount:', amount, 'USDC');

      const tipId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check sender's USDC balance first
      const profile = await this.getProfile(wallet.address);
      if (profile.usdcBalance < amount) {
        throw new Error(`Insufficient USDC balance. You have ${profile.usdcBalance.toFixed(2)} USDC but need ${amount} USDC`);
      }

      console.log('✅ Sender USDC balance verified:', profile.usdcBalance, 'USDC');

      // Convert amount to USDC units (6 decimals) - following Dynamic's pattern
      const amountInUsdcUnits = Math.floor(amount * 1_000_000);

      console.log('📋 Calling gasless API endpoint (Dynamic pattern)...');

      // Call our gasless API to prepare the transaction (following Dynamic's documentation)
      const response = await fetch(RELAYER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: wallet.address,
          recipientAddress: creatorWalletAddress,
          amount: amountInUsdcUnits,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Gasless API error:', response.status, responseData);
        throw new Error(responseData.message || 'Failed to prepare gasless transaction');
      }

      if (!responseData.success) {
        console.error('❌ Gasless API returned error:', responseData.message);
        throw new Error(responseData.message || 'Gasless transaction preparation failed');
      }

      console.log('✅ Gasless transaction prepared by relayer');

      // Get signer from wallet and the prepared transaction (Dynamic's approach)
      const { serializedTransaction } = responseData;
      const signer = await wallet.getSigner();

      console.log('📝 User signing and sending transaction...');

      try {
                 // Have the user sign and send the transaction (Dynamic's exact pattern)
         const transactionBuffer = bs58.decode(serializedTransaction);
         const transaction = Transaction.from(transactionBuffer);

         // Use Dynamic's signAndSendTransaction method
         const { signature } = await signer.signAndSendTransaction(transaction as any);

        console.log('🎉 REAL GASLESS USDC TIP SUCCESSFUL!');
        console.log('Transaction signature:', signature);

        const tipTransaction: TipTransaction = {
          id: tipId,
          signature: signature,
          amount,
          fromAddress: wallet.address,
          toAddress: creatorWalletAddress,
          timestamp: Date.now(),
          status: 'pending',
          gasless: true
        };

        // Monitor transaction confirmation
        this.monitorTransaction(signature);

        console.log('✅ REAL USDC tip completed (Dynamic SDK):', tipTransaction);
        return tipTransaction;

      } catch (signError) {
        console.error('❌ Transaction signing failed:', signError);
        throw new Error(`Error signing transaction: ${signError instanceof Error ? signError.message : String(signError)}`);
      }

    } catch (error) {
      console.error('❌ REAL gasless tip failed:', error);
      throw error;
    }
  }

  // Monitor REAL transaction confirmation
  private async monitorTransaction(signature: string): Promise<void> {
    try {
      console.log('🔄 Monitoring REAL transaction:', signature);
      
      // Wait for confirmation with timeout
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        console.error('❌ Transaction failed:', confirmation.value.err);
      } else {
        console.log('✅ REAL transaction confirmed:', signature);
      }
    } catch (error) {
      console.error('⚠️ Transaction monitoring failed:', error);
    }
  }

  // Get REAL transaction history for a wallet
  async getTransactionHistory(
    walletAddress: string,
    limit = 10
  ): Promise<TipTransaction[]> {
    try {
      console.log('🔄 Fetching REAL transaction history for:', walletAddress);
      
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions: TipTransaction[] = [];

      for (const sig of signatures) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            commitment: 'confirmed'
          });

          if (tx && tx.meta && !tx.meta.err) {
            // Parse transaction to extract tip information
            const tipTx: TipTransaction = {
              id: sig.signature,
              signature: sig.signature,
              amount: 0, // Would need to parse from transaction logs
              fromAddress: walletAddress,
              toAddress: '', // Would parse from transaction
              timestamp: (sig.blockTime || 0) * 1000,
              status: 'confirmed',
              gasless: false // Would need to determine from transaction
            };
            
            transactions.push(tipTx);
          }
        } catch (error) {
          console.warn('Failed to parse transaction:', sig.signature);
        }
      }

      console.log('✅ REAL transaction history fetched:', transactions.length, 'transactions');
      return transactions;
    } catch (error) {
      console.error('Failed to get REAL transaction history:', error);
      return [];
    }
  }

  // Request REAL devnet SOL and USDC for testing
  async requestDevnetFunds(walletAddress: string): Promise<{
    solSignature?: string;
    usdcSignature?: string;
  }> {
    try {
      console.log('🔄 Requesting REAL devnet funds for:', walletAddress);
      
      const publicKey = new PublicKey(walletAddress);
      const result: { solSignature?: string; usdcSignature?: string } = {};

      // Request SOL airdrop (1 SOL)
      try {
        const solSignature = await this.connection.requestAirdrop(
          publicKey,
          LAMPORTS_PER_SOL
        );
        await this.connection.confirmTransaction(solSignature);
        result.solSignature = solSignature;
        console.log('✅ REAL SOL airdrop successful:', solSignature);
      } catch (error) {
        console.warn('⚠️ SOL airdrop failed (rate limited?):', error);
      }

      // For USDC, we'd need a devnet faucet
      console.log('ℹ️ For USDC devnet funds, use: https://spl-token-faucet.com/');

      return result;
    } catch (error) {
      console.error('Failed to request REAL devnet funds:', error);
      throw error;
    }
  }

  // Get creator profile from blockchain
  async getCreatorProfile(handle: string): Promise<CreatorProfileOnChain | null> {
    try {
      const [creatorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator_profile"), Buffer.from(handle)],
        PROGRAM_ID
      );

      // This would use the actual Anchor program to fetch account data
      // For now, return null as we need to deploy the program first
      console.log('Creator profile PDA:', creatorProfilePda.toString());
      return null;
    } catch (error) {
      console.error('Failed to get creator profile:', error);
      return null;
    }
  }
}

// React hook for REAL blockchain operations with Dynamic SDK
export const useBlockchain = () => {
  const { primaryWallet } = useDynamicContext();
  const blockchainService = new BlockchainService();

  const getProfile = async (): Promise<BlockchainProfile | null> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return null;
    }
    
    try {
      return await blockchainService.getProfile(primaryWallet.address);
    } catch (error) {
      console.error('Failed to get REAL blockchain profile:', error);
      return null;
    }
  };

  const sendTip = async (
    creatorWalletAddress: string, 
    amount: number
  ): Promise<TipTransaction | null> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Solana wallet not connected');
    }

    console.log('🚀 SENDING REAL GASLESS USDC TIP via Dynamic SDK');
    return await blockchainService.sendTip(primaryWallet, creatorWalletAddress, amount);
  };

  const requestFunds = async (): Promise<any> => {
    if (!primaryWallet) {
      throw new Error('Wallet not connected');
    }

    return await blockchainService.requestDevnetFunds(primaryWallet.address);
  };

  const getTransactionHistory = async (): Promise<TipTransaction[]> => {
    if (!primaryWallet) {
      return [];
    }

    return await blockchainService.getTransactionHistory(primaryWallet.address);
  };

  return {
    getProfile,
    sendTip,
    requestFunds,
    getTransactionHistory,
    wallet: primaryWallet,
    isConnected: !!primaryWallet && isSolanaWallet(primaryWallet)
  };
};

// Export the service instance
export const blockchainService = new BlockchainService(); 