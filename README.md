# Bitcoin Token Minter for BNB Smart Chain

A full-stack ERC-20-style **mint-only, non-transferable** token minter for BNB Smart Chain. The app includes a Vite + React frontend, an Express API, an ownable Solidity contract, a Thirdweb SDK deployment script, and Render deployment configuration.

> **Important:** This project creates a separate token named Bitcoin (BTC). It is not Bitcoin, wrapped BTC, or an official Binance/Bitcoin asset. Deploying on BNB Smart Chain mainnet costs gas and cannot be undone. Review the contract and verify the deployer wallet before mainnet deployment.

## Features

- Mint a configurable amount of BTC tokens to a valid BSC address.
- Read token balance and token metadata.
- Soulbound behavior: transfers, approvals, and allowance changes revert; minting is owner-only.
- Backend validates addresses, amounts, API access, and transaction confirmation.
- Frontend displays transaction hash/status and refreshed balance.
- Thirdweb SDK deployment and ethers.js blockchain interaction.

## Folder structure

```text
bitcoin-token-minter/
├── backend/
│   ├── src/
│   │   ├── blockchain.js
│   │   ├── server.js
│   │   └── validation.js
│   ├── package.json
│   └── .env.example
├── contracts/
│   └── SoulboundBitcoin.sol
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── scripts/
│   └── deploy-thirdweb.js
├── .env.example
├── .gitignore
├── package.json
├── render.yaml
└── README.md
```

## Local setup

Requirements: Node.js 20+, npm, a funded BSC deployer wallet, and a Thirdweb project.

```bash
npm install --prefix backend
npm install --prefix frontend
cp .env.example backend/.env
```

Edit `backend/.env`. Never commit `.env` or a private key. `THIRDWEB_SECRET_KEY` and `WALLET_PRIVATE_KEY` stay server-side only; do not use them in Vite variables.

## Deploy the contract

The deployment script compiles `contracts/SoulboundBitcoin.sol` and deploys its ABI/bytecode through the Thirdweb SDK to BSC mainnet.

```bash
cd backend
npm run deploy:contract
```

The script prints the deployed address. Put that address in `backend/.env` as `CONTRACT_ADDRESS` and set `MINT_API_KEY` to a strong random secret. The deployer becomes the contract owner and is the only account allowed to mint.

Before mainnet use, inspect the contract and run a small-value test on BSC testnet by changing `RPC_URL`, `CHAIN_ID`, and the frontend/backend network settings.

## Run locally

```bash
# terminal 1
npm run dev --prefix backend

# terminal 2
npm run dev --prefix frontend
```

Open the Vite URL shown in the frontend terminal.

## API

### `POST /api/mint`

Request:

```json
{ "address": "0x...", "amount": "100.25", "apiKey": "optional-if-MINT_API_KEY-is-set" }
```

The API key may also be sent as `x-api-key`. Amounts are decimal token units and are converted using the contract's 18 decimals. The response includes `status`, `transactionHash`, `blockNumber`, and `balance`.

### `GET /api/balance/:address`

Returns the address, raw balance, formatted balance, symbol, and decimals.

### `GET /api/token-info`

Returns contract address, name, symbol, decimals, total supply, chain ID, and explorer URL.

## Render deployment

`render.yaml` defines one Node web service. Create a Render Blueprint from this repository, then add the following secret environment variables in Render:

- `RPC_URL`
- `CONTRACT_ADDRESS`
- `THIRDWEB_CLIENT_ID`
- `THIRDWEB_SECRET_KEY`
- `WALLET_PRIVATE_KEY`
- `MINT_API_KEY`

The frontend is built into `frontend/dist` and served by Express in production. Set `VITE_API_URL` to the Render service URL before building, or use the same-origin default.

## Security checklist

- Use a dedicated deployer/minter wallet with only the required BNB.
- Keep `WALLET_PRIVATE_KEY` and `THIRDWEB_SECRET_KEY` in Render secret variables only.
- Set `MINT_API_KEY`; add authentication, rate limiting, and audit logging before public launch.
- Do not expose a custodial private key in the browser.
- Verify the deployed bytecode and constructor arguments on BscScan.
- Have an independent Solidity/security review before production mainnet use.
