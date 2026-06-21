# KrishiVerse Blockchain

This folder contains the smart contract layer for the KrishiVerse platform. It is responsible for escrow-based agricultural contracts between a contractor/buyer and a farmer.

## Overview

The main contract is:
- `KrishiVerseEscrow.sol`

It manages contract creation, updates, acceptance, rejection, delivery confirmation, and fund release using on-chain escrow logic.

---

## Smart Contract Purpose

The contract is designed to handle a secure flow like this:

1. A contractor creates a contract and locks the full payment in escrow.
2. The farmer reviews the contract.
3. The farmer can accept or reject the contract.
4. If accepted, the farmer can mark the shipment as out for delivery.
5. Once the contractor confirms delivery, the escrow funds are released to the farmer.

---

## Contract Features

The contract supports the following states:
- `Created`
- `Accepted`
- `Rejected`
- `OutForDelivery`
- `Delivered`
- `Cancelled`

Key functions:
- `createContract(...)`
- `updateContract(...)`
- `acceptContract(...)`
- `rejectContract(...)`
- `markOutForDelivery(...)`
- `confirmDelivery(...)`
- `getContract(...)`
- `getContractBalance()`

---

## Important Contract Logic

### Create contract
- The contractor must send exactly the full amount: `quantity * pricePerTon`.
- The contract is created and stored on-chain.

### Update contract
- Allowed only before acceptance.
- If the price increases, the contractor must send the extra amount.
- If the price decreases, the difference is refunded to the contractor.

### Reject contract
- The farmer can reject the contract.
- The locked funds are returned to the contractor.

### Confirm delivery
- Only the contractor can confirm delivery after the farmer marks it out for delivery.
- The escrow amount is released to the farmer.

---

## Project Structure

- [contracts/KrishiVerseEscrow.sol](contracts/KrishiVerseEscrow.sol) - Main Solidity contract
- [artifacts/KrishiVerseEscrow.sol/KrishiVerseEscrow.json](artifacts/KrishiVerseEscrow.sol/KrishiVerseEscrow.json) - Compiled contract artifact
- [.env.sample](.env.sample) - Environment variable template

---

## Requirements

- Node.js
- npm
- A wallet (for deployment and testing)
- A blockchain network such as:
  - local testnet
  - Sepolia
  - Polygon
  - any EVM-compatible network

---

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the sample environment file:

```bash
copy .env.sample .env
```

3. Fill in the required values in `.env`:

```env
SECRET_KEY=YOURSECRETKEY
CLIENT_ID=THIRDWEB_CLIENTID
CONTRACT_ADDRESS=THIRDWEB_CONTRACT_ADDRESS
```

---

## Deployment Notes

This folder currently contains the Solidity contract and configuration template, but does not include a deployment script yet. You can deploy the contract using any of the following methods:

- Remix IDE
- Hardhat
- Foundry
- Thirdweb / thirdweb SDK

After deployment, update the contract address in your environment configuration.

---

## Environment Variables

- `SECRET_KEY` - used by the deployment or wallet integration flow
- `CLIENT_ID` - identity/client configuration for third-party blockchain tooling
- `CONTRACT_ADDRESS` - deployed escrow contract address

---

## Notes

- The contract uses `msg.value` to lock funds, so the payment must be sent correctly during contract creation.
- The contract currently includes escrow protection logic but should be reviewed carefully before production deployment.
- It is recommended to test the contract on a test network before using real funds.

---

## Suggested Next Improvements

- Add deployment scripts for Hardhat or Foundry
- Add automated tests for contract behavior
- Add event listeners for frontend integration
- Add admin or dispute-handling logic if needed
