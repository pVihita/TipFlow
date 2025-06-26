# FlowTip Relayer Backend

A Next.js API backend that enables gasless transactions for the FlowTip application by acting as a fee payer for Solana transactions.

## Features

- **Gasless Transactions**: Pays transaction fees on behalf of users
- **Security**: Private key never exposed to frontend
- **Flexible**: Supports both partial signing and full transaction processing
- **Error Handling**: Comprehensive error handling and validation
- **Balance Monitoring**: Checks relayer balance before processing transactions

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env.local
   ```

3. **Generate Relayer Keypair**:
   ```bash
   # Generate a new keypair for the relayer
   solana-keygen new --outfile relayer-keypair.json
   
   # Get the private key (base58 encoded)
   solana-keygen grind --starts-with relayer:1
   ```

4. **Fund the Relayer** (for devnet/mainnet):
   ```bash
   # For devnet testing
   solana airdrop 2 <relayer-public-key> --url devnet
   
   # For mainnet, send SOL to the relayer address
   ```

5. **Update Environment Variables**:
   - Copy the base58 encoded private key to `RELAYER_PRIVATE_KEY`
   - Set appropriate `SOLANA_RPC_URL` for your environment

6. **Start the Server**:
   ```bash
   npm run dev    # Development
   npm run build  # Production build
   npm run start  # Production server
   ```

## API Endpoints

### POST `/api/send-gasless-tx`

Processes gasless transactions by acting as the fee payer.

**Request Body**:
```json
{
  "serializedTransaction": "base58_encoded_transaction"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Gasless transaction completed successfully",
  "transactionSignature": "transaction_signature_or_partially_signed_transaction"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security Considerations

1. **Private Key Security**: Store the relayer private key securely and never expose it in client-side code
2. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
3. **Balance Monitoring**: Monitor relayer balance and set up alerts for low balances
4. **Transaction Validation**: Validate transactions before signing to prevent malicious usage
5. **Access Control**: Consider implementing authentication for production use

## Transaction Flow

1. Frontend creates an unsigned transaction
2. Frontend serializes transaction to base58
3. Frontend sends serialized transaction to relayer
4. Relayer deserializes and validates transaction
5. Relayer sets itself as fee payer and signs
6. Relayer either:
   - Returns partially signed transaction for client to complete
   - Fully processes transaction if no additional signatures needed

## Error Handling

The relayer handles various error scenarios:

- **Missing Environment Variables**: Returns 500 with configuration error
- **Invalid Transaction Format**: Returns 400 with serialization error
- **Insufficient Relayer Balance**: Returns 500 with balance error
- **Transaction Failures**: Returns 500 with transaction error
- **Missing Required Fields**: Returns 400 with validation error

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RELAYER_PRIVATE_KEY` | Base58 encoded private key of relayer | Required |
| `SOLANA_RPC_URL` | Solana RPC endpoint URL | `https://api.devnet.solana.com` | 