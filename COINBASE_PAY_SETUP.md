# Coinbase Pay Production Setup Guide

## 🎯 Current Status
✅ **Development**: Coinbase Pay widget integrated but requires production setup  
✅ **Testing**: Free devnet tokens available for full FlowTip testing  
⚠️ **Production**: Needs Coinbase Developer account + API keys  

---

## 🔧 Production Setup Steps

### 1. Create Coinbase Developer Account
1. Visit [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Sign up for a developer account
3. Verify your identity and business information

### 2. Create New Project
1. Click "Create New Project"
2. Choose "Coinbase Pay" integration
3. Configure your domain settings
4. Add your production domain (e.g., `https://flowtip.app`)

### 3. Get API Credentials
```env
# Add to frontend/.env.local
VITE_CDP_PROJECT_ID=your-project-id-here
VITE_COINBASE_PAY_API_KEY=your-api-key-here
VITE_APP_URL=https://your-domain.com
```

### 4. Configure Domain Whitelist
- Add your production domain to Coinbase Pay settings
- Localhost domains are not supported in production
- Use ngrok for development testing: `npx ngrok http 5174`

### 5. Set Up Webhook Endpoints (Optional)
- Configure webhook URLs for payment notifications
- Handle success/failure events server-side
- Implement idempotent order fulfillment

---

## 🧪 Testing Without Production Setup

### Free Devnet Tokens (Recommended)
```bash
# 1. Get your Solana wallet address from FlowTip
# 2. Visit faucets:

# SOL (for gas fees)
https://faucet.solana.com/

# USDC (for tips)  
https://faucet.circle.com/

# Alternative USDC
https://spl-token-faucet.com/?token-name=USDC-Dev
```

### External Wallet Transfer
1. Send USDC from Phantom, Solflare, etc.
2. Use your FlowTip wallet address
3. Solana devnet network

---

## 🚀 Production Benefits

When properly configured, Coinbase Pay enables:
- **Credit/Debit Card** purchases
- **Bank Transfer** funding  
- **Custom Amounts** ($10-$10,000)
- **Instant Delivery** to user wallets
- **Mobile Optimized** checkout flow
- **Regulatory Compliant** KYC/AML

---

## 🔍 Current Implementation

The Coinbase Pay widget is integrated at:
- `frontend/src/components/CoinbaseFundCard.tsx`
- Uses `@coinbase/cbpay-js` SDK
- Configured for Solana + USDC/SOL
- Handles sessionToken requirement gracefully

---

## 📞 Support

- **Coinbase Pay Docs**: https://docs.cdp.coinbase.com/
- **FlowTip Issues**: Create GitHub issue  
- **Development Help**: Check console logs for detailed errors

---

## ⚡ Quick Start for Testing

1. **Connect Solana wallet** in FlowTip
2. **Copy wallet address** from dashboard  
3. **Visit SOL faucet**: Get 1-2 SOL for gas
4. **Visit USDC faucet**: Get 100 USDC for tips
5. **Start sending tips** - fully functional!

> 💡 **Note**: Devnet tokens have zero real-world value but provide complete blockchain functionality for testing. 