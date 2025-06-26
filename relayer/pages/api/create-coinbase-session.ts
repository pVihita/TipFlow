import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Coinbase CDP API configuration
const CDP_SECRET = process.env.CDP_SECRET || 'FSZTY3OsUzaN/jZv0HvaGWvrqVvU6Umbl4UcavDlP9GvIQk0K1ttq5E6gPcCfSR7ihS84UFxOnv5bYzOBz4A/g==';
const CDP_PROJECT_ID = process.env.CDP_PROJECT_ID || '1e06c9a9-81d7-4a9b-872d-02e19a371aac';

// Function to sign CDP API requests
function signRequest(method: string, path: string, body: string, timestamp: number): string {
  const message = `${method}${path}${body}${timestamp}`;
  return crypto.createHmac('sha256', CDP_SECRET).update(message).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    console.log('🔵 Creating Coinbase session token for:', walletAddress);

    // Prepare the request for Coinbase CDP API
    const timestamp = Math.floor(Date.now() / 1000);
    const method = 'POST';
    const path = '/onramp/v1/token';
    
    const requestBody = {
      addresses: [{
        address: walletAddress,
        blockchains: ['solana']
      }],
      assets: ['USDC', 'SOL']
    };

    const body = JSON.stringify(requestBody);
    const signature = signRequest(method, path, body, timestamp);

    // Debug logging
    console.log('🔍 Request details:');
    console.log('- URL: https://api.developer.coinbase.com/onramp/v1/token');
    console.log('- Method:', method);
    console.log('- Path:', path);
    console.log('- Body:', body);
    console.log('- Timestamp:', timestamp);
    console.log('- Signature:', signature);
    console.log('- CDP Project ID:', CDP_PROJECT_ID);

    // Make request to Coinbase CDP API
    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CB-ACCESS-KEY': CDP_PROJECT_ID,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp.toString(),
      },
      body: body
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    console.log('📡 Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.error('❌ Raw response text:', responseText);
      return res.status(500).json({ 
        error: 'Invalid response from Coinbase API',
        rawResponse: responseText
      });
    }

    if (!response.ok) {
      console.error('❌ Coinbase API error:', data);
      return res.status(response.status).json({ 
        error: 'Failed to create session token',
        details: data 
      });
    }

    console.log('✅ Session token created successfully');
    
    return res.status(200).json({
      success: true,
      sessionToken: data.token,
      expiresAt: data.expires_at
    });

  } catch (error) {
    console.error('❌ Session token creation failed:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 