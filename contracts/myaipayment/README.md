# MyAiPayment

MyAiPayment is a Solana-based payment processing program built using Anchor. It allows an admin to manage payment settings, including token addresses, treasury wallets, developer wallets, and fees. It also supports pausing and resuming payments and facilitates secure token transfers.

## Prerequisites

- Rust
- Solana CLI
- Node.js and npm
- Anchor CLI
- Yarn

## Setup

1. Generate a keypair and fund it with some SOL:

```bash
cd contracts/myaipayment
solana-keygen new --outfile admin.json
```

2. Install dependencies:

```bash
yarn install
```
```

2. Ensure the network is set to Mainnet in Anchor.toml:

```bash
[provider]
cluster = "Mainnet"
```

## Build the Program

Build the Anchor program:

```bash
anchor build
```

## Deploy the Program

Deploy the Anchor program to the Solana blockchain:

```bash
anchor deploy
```
This will provide the deployed contract address

## Configuration

Run the configuration script to set up the program. This command runs the typescript located migrations/configure.ts. Update the variables TREASURY_ADDRESS, DEV_01_WALLET_ADDRESS, DEV_02_WALLET_ADDRESS, TOKEN_MINT_ADDRESS, DEV_01_FEE & DEV_02_FEE with approriate values before running the below command

```bash
anchor run configure
```