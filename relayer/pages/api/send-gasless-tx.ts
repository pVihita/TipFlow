import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  Connection, 
  Keypair, 
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey
} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import bs58 from 'bs58';

// This is the USDC token address on devnet from Dynamic's documentation
const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

// Environment variables for the relayer (following Dynamic's pattern)
const FEE_PAYER_PRIVATE_KEY = process.env.FEE_PAYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC || "https://api.devnet.solana.com";

type ApiResponse = {
  success: boolean;
  message?: string;
  serializedTransaction?: string;
  transactionSignature?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are accepted.',
    });
  }

  try {
    console.log('🚀 Dynamic SDK Gasless Transaction Handler Started');
    console.log('🔗 Relayer RPC Configuration:');
    console.log('- RPC URL:', RPC_URL);
    console.log('- Using Helius:', RPC_URL.includes('helius'));
    console.log('- Network:', RPC_URL.includes('mainnet') ? 'mainnet' : 'devnet');

    // Validate environment variables
    if (!FEE_PAYER_PRIVATE_KEY) {
      console.error('❌ FEE_PAYER_PRIVATE_KEY environment variable not set');
      return res.status(500).json({
        success: false,
        message: 'Missing fee payer private key in environment variables',
        error: 'Server configuration error'
      });
    }

    // Extract the request data (following Dynamic's API pattern)
    const { senderAddress, recipientAddress, amount } = req.body;

    // Basic validation
    if (!senderAddress || !recipientAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    console.log('📋 Transaction Details:');
    console.log('- From:', senderAddress);
    console.log('- To:', recipientAddress);
    console.log('- Amount:', amount, 'USDC');

    // Initialize connection to Solana
    const connection = new Connection(RPC_URL, "confirmed");

    // Set up the fee payer wallet (following Dynamic's pattern)
    const privateKeyBuffer = bs58.decode(FEE_PAYER_PRIVATE_KEY);
    const feePayer = Keypair.fromSecretKey(new Uint8Array(privateKeyBuffer));

    console.log('💰 Fee payer public key:', feePayer.publicKey.toString());

    // Convert addresses to PublicKey objects
    let sender: PublicKey;
    let recipient: PublicKey;
    try {
      sender = new PublicKey(senderAddress);
      recipient = new PublicKey(recipientAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid Solana address",
      });
    }

    // Get token accounts for sender and recipient (following Dynamic's approach)
    const senderTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      sender
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipient
    );

    const recipientTokenInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );

    const instructions = [];

    // Create recipient token account if it doesn't exist (Dynamic's pattern)
    if (!recipientTokenInfo) {
      console.log('📝 Creating recipient USDC token account...');
      instructions.push(
        createAssociatedTokenAccountInstruction(
          feePayer.publicKey, // Fee payer creates the account
          recipientTokenAccount,
          recipient,
          USDC_MINT
        )
      );
    }

    // Add transfer instruction (following Dynamic's exact pattern)
    console.log('💸 Adding USDC transfer instruction...');
    instructions.push(
      createTransferCheckedInstruction(
        senderTokenAccount,
        USDC_MINT,
        recipientTokenAccount,
        sender, // Sender signs for the transfer
        BigInt(amount), // Amount in USDC smallest units
        6 // USDC decimals
      )
    );

    // Create and partially sign transaction (Dynamic's gasless pattern)
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = feePayer.publicKey; // Fee payer pays gas
    
    // Add all instructions
    instructions.forEach((instruction) => transaction.add(instruction));
    
    // Partially sign with fee payer (Dynamic's approach)
    transaction.partialSign(feePayer);

    console.log('✅ Transaction prepared and partially signed by fee payer');

    // Serialize the transaction to send back to client (Dynamic's pattern)
    const serializedTransaction = bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    );

    console.log('📤 Returning partially signed transaction to client');

    return res.status(200).json({
      success: true,
      serializedTransaction,
      message: transaction.serializeMessage().toString("base64"),
    });

  } catch (error) {
    console.error('❌ Gasless transaction handler error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
} 