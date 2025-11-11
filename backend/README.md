# Backend API

Express.js server yang berinteraksi dengan smart contract.

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Copy .env.example ke .env:
```bash
   cp .env.example .env
```

3. Update CONTRACT_ADDRESS di .env setelah deploy contract

4. Run server:
```bash
   npm run dev
```

## Endpoints

- GET /api/health
- GET /api/stats
- POST /api/events/create
- POST /api/tickets/generate
- GET /api/tickets/verify/:ticketId