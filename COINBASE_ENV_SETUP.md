# 🔧 Coinbase Pay Environment Setup

## Step 1: Add Environment Variables

Add these to your `relayer/.env.local` file:

```bash
# Existing Solana Configuration (keep these)
FEE_PAYER_PRIVATE_KEY=WBvt1qfYEj8Sw35itfqY75utTtLegbBWRWaNUMvowdhyEge1bc1n2fJAcCSedGkDSA2cu5JutoKKZvaX1BU4Vcr
NEXT_PUBLIC_RPC=https://devnet.helius-rpc.com/?api-key=e5200119-68d9-4632-b33c-7d96f94af422
NODE_ENV=development

# NEW: Coinbase CDP Configuration (ADD THESE)
CDP_SECRET=FSZTY3OsUzaN/jZv0HvaGWvrqVvU6Umbl4UcavDlP9GvIQk0K1ttq5E6gPcCfSR7ihS84UFxOnv5bYzOBz4A/g==
CDP_PROJECT_ID=1e06c9a9-81d7-4a9b-872d-02e19a371aac
```

## Step 2: Restart Your Apps

1. **Stop** `npm run dev` (Ctrl+C)
2. **Start again**: `npm run dev`
3. **Wait** for both servers to start

## Step 3: Test Locally with ngrok

1. **Install ngrok**: `npm install -g ngrok` ✅ (already done)
2. **Run ngrok**: `ngrok http 5174`
3. **Copy HTTPS URL**: Like `https://abc123.ngrok.io`

## Step 4: Configure Coinbase Developer Portal

1. **Go to**: [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. **Select your project**: ID `1e06c9a9-81d7-4a9b-872d-02e19a371aac`
3. **Navigate to**: 
   - **"Settings"** → **"Domains"** OR
   - **"Coinbase Pay Settings"** → **"Allowed Origins"** OR
   - **"Integration Settings"** → **"Domains"**
4. **Add your ngrok URL**: `https://abc123.ngrok.io`
5. **Save changes**

## Step 5: Test Coinbase Pay

1. **Visit**: Your ngrok URL (e.g., `https://abc123.ngrok.io`)
2. **Connect wallet** via Dynamic
3. **Click "Add Funds"**
4. **Check console**: Should see:
   ```
   🔵 Getting session token for Coinbase Pay...
   ✅ Session token received
   🚀 Opening Coinbase Pay with session token
   ```
5. **New tab opens**: Coinbase Pay with your wallet pre-configured

## 🐛 Troubleshooting

### Error: "Session token failed"
- ✅ Check `relayer/.env.local` has CDP credentials
- ✅ Restart relayer: Stop and start `npm run dev`

### Error: "Domain not allowed"  
- ✅ Add ngrok URL to Coinbase Developer Portal
- ✅ Use HTTPS ngrok URL (not HTTP)

### Error: "fields must be array of Layout instances"
- ✅ Fixed in new `DynamicProviderNew.tsx`
- ✅ App now imports from `DynamicProviderNew`

## ✅ Success Indicators

- **Console shows**: Session token messages
- **New tab opens**: Coinbase Pay interface
- **Wallet pre-filled**: Your Solana address
- **Assets available**: USDC and SOL options 