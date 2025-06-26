# FlowTip Real Blockchain Setup

## 🚀 Making Real USDC Tips Work on Solana Devnet

This guide sets up FlowTip to process **real blockchain transactions** on Solana devnet using actual USDC tokens.

### Prerequisites

1. **Node.js** (v18+)
2. **Solana CLI** (for wallet management)
3. **Devnet SOL and USDC** (for testing)

### Step 1: Environment Configuration

Create `relayer/.env.local`:

```bash
# Solana Devnet Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Relayer Wallet (Base58 private key)
RELAYER_PRIVATE_KEY=your_base58_private_key_here

# Security Settings
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT=60
MAX_TIP_AMOUNT=1000
NODE_ENV=development
```

### Step 2: Generate Relayer Wallet

```bash
# Generate new keypair
solana-keygen new --outfile relayer-keypair.json

# Convert to base58 (use convert-keypair.js)
node convert-keypair.js

# Fund the relayer wallet with devnet SOL
solana airdrop 2 --url devnet
```

### Step 3: USDC Token Setup

**Devnet USDC Mint Address:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

#### Option 1: Circle Faucet
Visit: https://faucet.circle.com/

#### Option 2: Solana CLI
```bash
# Create USDC token account
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --url devnet

# Request USDC (requires faucet or mint authority)
# Users can get test USDC from various devnet faucets
```

### Step 4: Start Real Transaction Flow

1. **Start Relayer:**
   ```bash
   cd relayer
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Step 5: Testing Real Transactions

1. **Connect Wallet:** Use Dynamic SDK to connect a Solana wallet
2. **Fund Wallet:** Get devnet SOL and USDC using the funding buttons
3. **Send Real Tip:** Navigate to a creator's tip page and send actual USDC
4. **Verify on Explorer:** Check transaction on Solscan (devnet mode)

### Transaction Flow

```
1. User connects Solana wallet via Dynamic SDK
2. User selects tip amount (real USDC)
3. Frontend creates transaction with USDC transfer
4. Transaction signed by user wallet
5. Relayer pays gas fees (gasless for user)
6. Real USDC transferred on Solana devnet
7. Transaction recorded in Firestore with real signature
```

### Real vs Mock Features

| Feature | Status |
|---------|--------|
| Wallet Connection | ✅ Real (Dynamic SDK) |
| USDC Balance Check | ✅ Real (Solana RPC) |
| Transaction Signing | ✅ Real (User Wallet) |
| Gas Payment | ✅ Real (Relayer Pays) |
| USDC Transfer | ✅ Real (On-chain) |
| Transaction History | ✅ Real (Blockchain + Firestore) |

### Important Notes

- **Devnet Only:** These are test transactions with no real value
- **Rate Limited:** Relayer includes abuse protection
- **Gasless:** Users don't pay transaction fees
- **Verified:** All transactions are on-chain and verifiable

### Troubleshooting

1. **"Insufficient Funds"** → Use funding buttons to get devnet tokens
2. **"Wallet Not Connected"** → Connect via Dynamic widget
3. **"Transaction Failed"** → Check relayer logs and SOL balance
4. **"RPC Error"** → Verify SOLANA_RPC_URL in environment

### Security Considerations

- Relayer wallet should have limited SOL (only for gas)
- Environment variables should be properly secured
- Rate limiting prevents abuse
- Maximum tip amounts are enforced

---

🎉 **Congratulations!** FlowTip is now processing real blockchain transactions!

Users can send actual USDC tips on Solana devnet with zero gas fees thanks to the relayer infrastructure. 