import { Transaction, PublicKey, Connection } from '@solana/web3.js';

/**
 * Validates if a transaction is safe to process by the relayer
 */
export function validateTransaction(transaction: Transaction): {
  isValid: boolean;
  error?: string;
} {
  // Check if transaction has instructions
  if (!transaction.instructions || transaction.instructions.length === 0) {
    return { isValid: false, error: 'Transaction has no instructions' };
  }

  // Check if transaction has too many instructions (potential spam)
  if (transaction.instructions.length > 10) {
    return { isValid: false, error: 'Transaction has too many instructions' };
  }

  // Validate instruction accounts
  for (const instruction of transaction.instructions) {
    if (!instruction.programId) {
      return { isValid: false, error: 'Instruction missing program ID' };
    }
    
    if (instruction.keys.length > 20) {
      return { isValid: false, error: 'Instruction has too many accounts' };
    }
  }

  return { isValid: true };
}

/**
 * Estimates the transaction fee for a given transaction
 */
export async function estimateTransactionFee(
  connection: Connection,
  transaction: Transaction
): Promise<number> {
  try {
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );
    return fee?.value || 5000; // Default fee if estimation fails
  } catch (error) {
    console.warn('Failed to estimate transaction fee:', error);
    return 5000; // Fallback fee
  }
}

/**
 * Checks if the relayer has sufficient balance for the transaction
 */
export async function checkRelayerBalance(
  connection: Connection,
  relayerPublicKey: PublicKey,
  estimatedFee: number
): Promise<{ hasSufficientBalance: boolean; balance: number }> {
  const balance = await connection.getBalance(relayerPublicKey);
  return {
    hasSufficientBalance: balance >= estimatedFee,
    balance,
  };
}

/**
 * Logs transaction details for monitoring
 */
export function logTransactionDetails(transaction: Transaction) {
  console.log('Transaction Details:');
  console.log(`- Instructions: ${transaction.instructions.length}`);
  console.log(`- Fee Payer: ${transaction.feePayer?.toString()}`);
  console.log(`- Recent Blockhash: ${transaction.recentBlockhash}`);
  
  transaction.instructions.forEach((instruction, index) => {
    console.log(`- Instruction ${index + 1}:`);
    console.log(`  - Program ID: ${instruction.programId.toString()}`);
    console.log(`  - Keys: ${instruction.keys.length}`);
    console.log(`  - Data length: ${instruction.data.length}`);
  });
} 