# FlowTip: The Dynamic SDK Feature Showcase

FlowTip is a cutting-edge application demonstrating gasless USDC micro-tipping for creators using the Dynamic SDK.

## Architecture

- **Frontend**: React with Dynamic SDK integration
- **Smart Contract**: Solana (Rust/Anchor framework)
- **Relayer Backend**: Next.js API routes for gasless transactions

## Phase 1 Implementation

### 1. Solana Anchor Smart Contract (`/flowtip-program`)
- Creator profile management with PDAs
- Gasless USDC micro-tipping functionality
- USDC Associated Token Account handling

### 2. Gasless Transaction Relayer (`/relayer`)
- Next.js API routes for transaction relay
- Fee payer abstraction for seamless UX

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build and test the Anchor program:
   ```bash
   npm run anchor:build
   npm run anchor:test
   ```

3. Start the relayer backend:
   ```bash
   npm run relayer:dev
   ```

## Project Structure

```
flowtip/
├── flowtip-program/          # Solana Anchor smart contract
│   ├── programs/
│   │   └── flowtip-program/
│   │       └── src/
│   │           └── lib.rs
│   ├── tests/
│   └── Anchor.toml
├── relayer/                  # Gasless transaction relayer
│   ├── pages/
│   │   └── api/
│   └── package.json
└── README.md
``` 