# Smart Contracts

Solidity smart contracts untuk ticketing system.

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Copy .env.example ke .env:
```bash
   cp .env.example .env
```

3. Compile contracts:
```bash
   npx hardhat compile
```

4. Deploy:
```bash
   npx hardhat run scripts/deploy.js --network localhost
```