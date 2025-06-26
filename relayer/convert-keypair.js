const fs = require('fs');
const bs58 = require('bs58');

// Read the keypair JSON file
const keypairPath = './relayer-keypair.json';
const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));

// Convert to Uint8Array and then to base58
const keypairArray = new Uint8Array(keypairJson);
const base58PrivateKey = bs58.encode(keypairArray);

console.log('Base58 Private Key:');
console.log(base58PrivateKey);
console.log('\nAdd this to your .env.local file:');
console.log(`RELAYER_PRIVATE_KEY=${base58PrivateKey}`);

// Also show the public key for verification
const publicKeyArray = keypairArray.slice(32, 64);
const base58PublicKey = bs58.encode(publicKeyArray);
console.log(`\nPublic Key (for verification): ${base58PublicKey}`); 