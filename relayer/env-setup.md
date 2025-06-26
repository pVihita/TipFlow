# Relayer Environment Setup

Add these variables to your `relayer/.env.local` file:

```bash
# Existing Solana Configuration
FEE_PAYER_PRIVATE_KEY=WBvt1qfYEj8Sw35itfqY75utTtLegbBWRWaNUMvowdhyEge1bc1n2fJAcCSedGkDSA2cu5JutoKKZvaX1BU4Vcr
NEXT_PUBLIC_RPC=https://devnet.helius-rpc.com/?api-key=e5200119-68d9-4632-b33c-7d96f94af422
NODE_ENV=development

# NEW: Coinbase CDP Configuration
CDP_SECRET=FSZTY3OsUzaN/jZv0HvaGWvrqVvU6Umbl4UcavDlP9GvIQk0K1ttq5E6gPcCfSR7ihS84UFxOnv5bYzOBz4A/g==
CDP_PROJECT_ID=1e06c9a9-81d7-4a9b-872d-02e19a371aac
```

## After adding these variables:

1. **Restart your relayer**: Stop and restart `npm run dev`
2. **Test the endpoint**: Visit `http://localhost:3001/api/create-coinbase-session` 
3. **Check logs**: Should see "✅ Session token created successfully"

## For ngrok testing:

1. **Run**: `ngrok http 5174`
2. **Copy https URL**: Like `https://abc123.ngrok.io`
3. **Add to Coinbase Developer Portal**: Settings → Domains
4. **Test**: Click "Add Funds" → Should open Coinbase Pay 