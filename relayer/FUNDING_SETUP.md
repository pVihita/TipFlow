# FlowTip Funding Integration Setup Guide

This guide explains how to set up real money funding integrations for FlowTip using trusted providers like Coinbase OnRamp, Stripe Crypto, and Ramp Network.

## Overview

FlowTip supports multiple funding methods:

1. **Coinbase OnRamp** - Official Coinbase on-ramp with credit cards and bank transfers
2. **Stripe Crypto OnRamp** - Enterprise-grade fiat-to-crypto conversion
3. **Ramp Network** - Fast crypto purchases with global payment methods
4. **Bridge Transfers** - Transfer from other blockchains
5. **External Wallets** - Direct transfers from existing wallets

## 🔵 Coinbase OnRamp Setup

### 1. Get Coinbase Developer Account
1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Create an account or sign in
3. Navigate to "Products" → "OnRamp"

### 2. Create an OnRamp Project
1. Click "Create Project"
2. Fill in your project details:
   - **Project Name**: FlowTip
   - **Description**: Creator tipping platform
   - **Website**: Your domain
3. Save the project

### 3. Get Your App ID
1. In your project dashboard, find your **Project ID** (also called App ID)
2. It will look like: `1e06c9a9-81d7-4a9b-872d-02e19a371aac`
3. Add to your environment variables:
   ```env
   REACT_APP_COINBASE_APP_ID=1e06c9a9-81d7-4a9b-872d-02e19a371aac
   ```

### 4. Configure Allowed Domains
1. In project settings, add your domains:
   - `http://localhost:5173` (for development)
   - `http://localhost:5174` (alternative dev port)
   - `http://localhost:3000` (if testing from relayer)
   - Your production domain
2. Save settings

⚠️ **Important**: Coinbase OnRamp will only work from whitelisted domains!

### 5. Test Integration
- Coinbase OnRamp works immediately in sandbox mode
- For production, you'll need to complete KYB (Know Your Business) verification

## 💳 Stripe Crypto OnRamp Setup

### 1. Get Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or sign in
3. Navigate to "Products" → "Crypto"

### 2. Enable Crypto OnRamp
1. Click "Enable Crypto OnRamp"
2. Complete the setup wizard
3. Provide business information

### 3. Get API Keys
1. Go to "Developers" → "API keys"
2. Copy your keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

### 4. Install Stripe SDK
```bash
cd relayer
npm install stripe
```

### 5. Configure Webhooks (Optional)
1. Go to "Developers" → "Webhooks"
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events: `crypto.onramp_session.completed`

## ⚡ Ramp Network Setup

### 1. Get Ramp Account
1. Go to [Ramp Network](https://ramp.network/)
2. Click "Start Building" or "Get API Access"
3. Complete the application

### 2. Get API Credentials
1. Once approved, access your dashboard
2. Navigate to "API" section
3. Copy your API key:
   ```env
   REACT_APP_RAMP_API_KEY=your_ramp_api_key
   ```

### 3. Configure Settings
1. Set allowed domains in Ramp dashboard
2. Configure supported assets (USDC, SOL, ETH)
3. Set your branding (logo, colors)

## 🔧 Environment Setup

### 1. Update Environment Files

**Frontend (.env.local)**:
```env
REACT_APP_COINBASE_APP_ID=your_coinbase_app_id
REACT_APP_RAMP_API_KEY=your_ramp_api_key
```

**Relayer (.env.local)**:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### 2. Install Dependencies
```bash
# In relayer directory
cd relayer
npm install stripe

# In frontend directory  
cd frontend
# No additional dependencies needed
```

## 🧪 Testing

### Test Mode vs Production

All providers support test/sandbox modes:

- **Coinbase**: Automatic sandbox mode for development
- **Stripe**: Use test keys (sk_test_..., pk_test_...)
- **Ramp**: Sandbox environment available

### Test Cards

**For Stripe Testing**:
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002500003155`

### Test Flow

1. Start your development servers:
   ```bash
   npm run dev
   ```

2. Navigate to dashboard and click "Add Funds"

3. Select a provider and test the flow

4. Check console logs for transaction details

## 🚀 Production Deployment

### 1. Verification Requirements

**Coinbase OnRamp**:
- Complete KYB verification
- Provide business documents
- Wait for approval (1-2 weeks)

**Stripe Crypto**:
- Complete business verification
- Provide business documents
- Wait for approval (3-5 days)

**Ramp Network**:
- Complete partner application
- Business verification required
- Wait for approval (1-2 weeks)

### 2. Production Environment Variables

Replace test values with production keys:

```env
# Production Coinbase
REACT_APP_COINBASE_APP_ID=prod_app_id

# Production Stripe  
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Production Ramp
REACT_APP_RAMP_API_KEY=prod_ramp_key
```

### 3. Security Considerations

- Never expose secret keys in frontend code
- Use HTTPS in production
- Implement proper CORS headers
- Set up webhook signature verification
- Monitor transactions for fraud

## 📱 Mobile Considerations

### Progressive Web App (PWA)
- Funding modals work in mobile browsers
- Consider PWA installation prompts
- Test on iOS Safari and Android Chrome

### Deep Links
- Some providers support deep links to their mobile apps
- Coinbase can open in Coinbase Wallet app
- Configure custom URL schemes if needed

## 🔍 Troubleshooting

### Common Issues

**"Missing or invalid parameters" (Coinbase)**:
- Check App ID is correct
- Verify domain is whitelisted
- Ensure wallet address format is correct

**"Invalid API key" (Stripe)**:
- Verify key starts with sk_test_ or sk_live_
- Check key is for correct Stripe account
- Ensure Crypto OnRamp is enabled

**"Access denied" (Ramp)**:
- Verify API key is correct
- Check if domain is whitelisted
- Ensure account is approved

### Debug Mode

Enable debug logging:

```env
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

### Support Contacts

- **Coinbase**: [Developer Support](https://docs.cdp.coinbase.com/onramp/docs)
- **Stripe**: [Crypto Support](https://support.stripe.com/topics/crypto)
- **Ramp**: [Partner Support](https://docs.ramp.network/)

## 📊 Analytics & Monitoring

### Track Conversions
- Monitor funding completion rates
- Track which providers perform best
- Analyze user drop-off points

### Error Monitoring
- Set up Sentry or similar for error tracking
- Monitor API failure rates
- Track user support requests

### Financial Monitoring
- Monitor transaction volumes
- Track fee costs vs revenue
- Set up alerts for unusual activity

---

**Next Steps**: Once you've completed setup for at least one provider, test the full funding flow end-to-end before deploying to production. 