# FlowTip Phase 1 Setup Guide

This guide will help you set up and run Phase 1 of FlowTip: the Solana smart contract and gasless transaction relayer.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Solana CLI** (v1.17 or higher)
- **Anchor Framework** (v0.29.0)

### Installing Prerequisites

1. **Install Rust**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **Install Solana CLI**:
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.31/install)"
   ```

3. **Install Anchor**:
   ```bash
   npm install -g @coral-xyz/anchor-cli@latest
   ```

4. **Verify Installations**:
   ```bash
   node --version     # Should be v18+
   rust --version     # Should show rustc version
   solana --version   # Should show solana-cli version
   anchor --version   # Should show anchor-cli version
   ```

## Project Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Anchor program dependencies
cd flowtip-program
npm install
cd ..

# Install relayer dependencies
cd relayer
npm install
cd ..
```

### 2. Solana Configuration

```bash
# Set up Solana configuration for development
solana config set --url localhost  # For local testing
# solana config set --url devnet   # For devnet testing

# Generate a keypair for development (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your configuration
solana config get
```

### 3. Local Solana Validator (Optional for Testing)

For local testing, start a local Solana validator:

```bash
# Start local validator (in a separate terminal)
solana-test-validator

# In another terminal, check if it's running
solana cluster-version
```

### 4. Smart Contract Setup

```bash
cd flowtip-program

# Build the program
anchor build

# Deploy to local validator (make sure it's running)
anchor deploy

# Run tests
anchor test --skip-local-validator
```

### 5. Relayer Setup

```bash
cd relayer

# Copy environment template
cp env.template .env.local

# Generate a keypair for the relayer
solana-keygen new --outfile relayer-keypair.json

# Get the base58 private key (you'll need this for .env.local)
# Note: Keep this private key secure!
cat relayer-keypair.json | jq -r '.[0:32]' | python3 -c "
import sys
import base58
import json
data = json.load(sys.stdin)
print(base58.b58encode(bytes(data)).decode())
"

# Or use this simpler method:
solana-keygen pubkey relayer-keypair.json  # This gives you the public key
# Use a tool to convert the JSON array to base58, or use the following:
```

**Alternative method to get base58 private key:**
```bash
# Create a simple script to convert keypair to base58
echo 'import json, base58, sys; data=json.load(sys.stdin); print(base58.b58encode(bytes(data)).decode())' > to_base58.py
python3 to_base58.py < relayer-keypair.json
```

### 6. Environment Configuration

Edit `relayer/.env.local`:

```bash
# Replace with your actual base58 encoded private key
RELAYER_PRIVATE_KEY=your_base58_private_key_here

# Set the appropriate Solana RPC URL
SOLANA_RPC_URL=http://localhost:8899        # For local validator
# SOLANA_RPC_URL=https://api.devnet.solana.com  # For devnet
```

### 7. Fund the Relayer

```bash
# Get the relayer's public key
solana-keygen pubkey relayer-keypair.json

# Fund the relayer with SOL for transaction fees
# For local validator:
solana airdrop 10 <RELAYER_PUBLIC_KEY>

# For devnet:
solana airdrop 2 <RELAYER_PUBLIC_KEY> --url devnet

# Check balance
solana balance <RELAYER_PUBLIC_KEY>
```

### 8. Start the Relayer

```bash
cd relayer
npm run dev
```

The relayer will be available at `http://localhost:3000`

## Testing the Setup

### 1. Test Smart Contract

```bash
cd flowtip-program
anchor test --skip-local-validator
```

### 2. Test Relayer API

```bash
# Test if the relayer is running
curl -X POST http://localhost:3000/api/send-gasless-tx \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'

# Should return a 400 error about missing serializedTransaction (expected)
```

### 3. Integration Test

You can create a simple test transaction:

```javascript
// test-transaction.js
const { Connection, Transaction, SystemProgram, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

async function createTestTransaction() {
  const connection = new Connection('http://localhost:8899', 'confirmed');
  const payer = Keypair.generate();
  const recipient = Keypair.generate();
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 1000000, // 0.001 SOL
    })
  );
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;
  
  const serialized = bs58.encode(transaction.serialize({ requireAllSignatures: false }));
  console.log('Serialized transaction:', serialized);
}

createTestTransaction();
```

## Troubleshooting

### Common Issues

1. **"anchor: command not found"**
   - Install Anchor globally: `npm install -g @coral-xyz/anchor-cli@latest`

2. **"Program not found" during deployment**
   - Make sure local validator is running
   - Check Solana config: `solana config get`

3. **Relayer balance errors**
   - Fund the relayer account with SOL
   - Check balance: `solana balance <RELAYER_PUBLIC_KEY>`

4. **TypeScript errors**
   - Install dependencies: `npm install` in respective directories
   - The errors will resolve after dependencies are installed

5. **Test failures**
   - Ensure local validator is running
   - Make sure program is built and deployed: `anchor build && anchor deploy`

### Logs and Debugging

- **Anchor logs**: Check `flowtip-program/.anchor/program-logs/`
- **Relayer logs**: Console output from `npm run dev`
- **Solana validator logs**: If running local validator

## Next Steps

Once Phase 1 is working:

1. **Frontend Integration**: Create React frontend with Dynamic SDK
2. **Enhanced Security**: Add rate limiting and authentication to relayer
3. **Monitoring**: Add transaction monitoring and alerting
4. **Testing**: Add more comprehensive test coverage
5. **Deployment**: Deploy to devnet/mainnet

## Project Structure

```
flowtip/
├── flowtip-program/          # Solana Anchor smart contract
│   ├── programs/
│   │   └── flowtip-program/
│   │       └── src/
│   │           └── lib.rs    # Main contract logic
│   │       
│   ├── tests/
│   │   └── flowtip-program.ts # Contract tests
│   ├── Anchor.toml          # Anchor configuration
│   └── package.json
├── relayer/                 # Gasless transaction relayer
│   ├── pages/
│   │   └── api/
│   │       └── send-gasless-tx.ts # Main API endpoint
│   ├── utils/
│   │   └── transaction-helper.ts  # Utility functions
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
├── package.json             # Root package.json
├── README.md               # Project overview
└── SETUP.md               # This setup guide
```

## Smart Contract Features

- **Creator Profiles**: PDA-based creator profiles with unique handles
- **USDC Tipping**: Secure USDC transfer functionality
- **Statistics Tracking**: Track total tips and tip counts
- **Error Handling**: Comprehensive error handling with custom errors

## Relayer Features

- **Gasless Transactions**: Pay fees on behalf of users
- **Security**: Private key protection and validation
- **Flexible Processing**: Partial signing or full transaction processing
- **Monitoring**: Balance checking and transaction logging 