# Coinbase OnRamp Testing Guide

Coinbase OnRamp doesn't support localhost domains for security reasons. Here are several ways to test it properly:

## 🚀 Option 1: ngrok (Recommended)

### Step 1: Install ngrok (already done)
```bash
npm install -g ngrok
```

### Step 2: Start your development server
```bash
npm run dev
# Your app will run on http://localhost:5174
```

### Step 3: Create public tunnel
```bash
ngrok http 5174
```

You'll get output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5174
```

### Step 4: Add ngrok URL to Coinbase
1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Find your FlowTip project
3. Go to Settings → Allowed Domains
4. Add: `https://abc123.ngrok.io`
5. Save settings

### Step 5: Test
- Visit `https://abc123.ngrok.io` in your browser
- Click "Add Funds" → "Coinbase Onramp"
- Should work normally!

## 🌐 Option 2: Free Hosting (Netlify/Vercel)

### Netlify (Quick Deploy)
1. Build your project:
   ```bash
   cd frontend
   npm run build
   ```

2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

3. Get your URL (like `https://amazing-name-123.netlify.app`)

4. Add this URL to Coinbase project settings

### Vercel (GitHub Integration)
1. Push your code to GitHub
2. Connect GitHub to [Vercel](https://vercel.com)
3. Deploy and get your URL
4. Add URL to Coinbase settings

## 🔧 Option 3: Local DNS Override

### Add to hosts file (Windows)
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add line: `127.0.0.1 test.flowtip.local`
3. Save file

### Update Coinbase settings
- Add `https://test.flowtip.local:5174` to allowed domains

### Access your app
- Visit `https://test.flowtip.local:5174`
- (You may need to accept browser security warnings)

## 🏗️ Option 4: Use External Wallet for Now

For immediate testing without setup:

1. Click "Add Funds"
2. Select "External Wallet Transfer" 
3. Follow the manual instructions
4. Send crypto from Phantom, MetaMask, etc.

## 📱 Quick Test Steps

Once you have a public URL:

1. **Configure Coinbase**:
   - Project ID: `1e06c9a9-81d7-4a9b-872d-02e19a371aac` ✅
   - Allowed Domain: Your public URL ✅

2. **Test Flow**:
   - Visit your public URL
   - Connect wallet with Dynamic
   - Click "Add Funds"
   - Select "Coinbase Onramp"
   - Should open Coinbase widget!

3. **Expected Behavior**:
   - **Sandbox mode**: Test purchases (no real money)
   - **Real payments**: Need KYB verification
   - **Success**: Crypto appears in your wallet

## 🐛 Troubleshooting

### "Missing or invalid parameters"
- ✅ Check Project ID is correct
- ✅ Verify domain is in allowed list
- ✅ Ensure URL uses HTTPS (not HTTP)

### "Access denied"
- ✅ Domain whitelist takes a few minutes to update
- ✅ Try refreshing Coinbase project settings
- ✅ Clear browser cache

### Popup blocked
- ✅ Allow popups for your domain
- ✅ Try different browser
- ✅ Disable popup blockers

## 💡 Pro Tips

1. **ngrok URL changes**: Free ngrok URLs change each restart. Paid ngrok has static URLs.

2. **HTTPS Required**: Coinbase requires HTTPS. ngrok provides this automatically.

3. **Sandbox Testing**: Coinbase automatically uses sandbox mode for test domains.

4. **Multiple Domains**: You can add multiple URLs to test different environments.

5. **Production Ready**: Once it works with your test URL, production deployment will work the same way.

---

**Recommendation**: Start with ngrok (Option 1) - it's the fastest way to get a working test environment! 🚀 