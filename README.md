# StellarPay Pro 🚀

> Next-Generation Stellar Payments & Soroban Smart Contract dApp built for the Stellar Build Challenge (Level 1 Submission).

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-00f2fe?style=flat-square&logo=stellar)
![Freighter Approved](https://img.shields.io/badge/Freighter-v2.0.0-purple?style=flat-square)
![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

---

## 🌟 Overview

**StellarPay Pro** is a high-performance Web3 financial application built on top of the Stellar Network and Soroban smart contract ecosystem. Designed with glassmorphic aesthetics, strict decoupled architecture, and real-time Horizon REST synchronization.

---

## ✨ Features (Level 1 Completed)

- **Freighter Wallet Connector**: Native authorization flow via `@stellar/freighter-api` v2.0.0 with strict 56-character Ed25519 (`G...`) public key validation.
- **Session Management & Disconnect**: Persistent connection state with full reset on disconnect.
- **Stellar Testnet Sync**: Automatic query of Horizon Testnet REST API for live XLM and custom anchor token balances.
- **Friendbot Faucet Integration**: One-click testnet funding requesting 10,000 Testnet XLM for newly created or unfunded accounts.
- **Direct XLM Payments**: Construct, sign, and submit real payment operations to Horizon Testnet with optional memos (`MEMO_TEXT` or `MEMO_ID`).
- **Cryptographic Feedback & Hash Display**: Instant user feedback displaying 64-character transaction hashes with direct StellarExpert Explorer links.
- **Resilient Error Handling**: Clean catching and reporting for user cancellations, wallet rejections, insufficient balances, and network mismatches.

---

## 🛠️ Technology Stack

- **Core Framework**: React 18 + Vite
- **Language**: TypeScript (Strict mode enabled, 0 type errors)
- **Styling**: Tailwind CSS + Vanilla CSS Glassmorphism + Lucide React Icons
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Stellar Integration**:
  - `@stellar/stellar-sdk` (v13.0.0)
  - `@stellar/freighter-api` (v2.0.0)
- **Testing & Quality**: Vitest (16 unit tests passing), ESLint 9 (0 errors)

---

## 🚀 Local Setup Instructions

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Freighter Browser Extension**: Installed in Chrome or Edge ([Get Freighter](https://www.freighter.app/))

### Installation & Launch

```bash
# 1. Clone the repository
git clone https://github.com/your-username/stellarpay-pro.git
cd stellarpay-pro

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will launch at `http://localhost:3000`.

---

## 📖 How to Use StellarPay Pro

### 1. How to Connect Freighter Wallet
1. Open `http://localhost:3000` in Chrome/Edge with Freighter extension installed.
2. Click **Connect Wallet** in the top Navbar or Wallet Page.
3. Select **Freighter Wallet**.
4. In the Freighter extension popup, click **Approve**.
5. Your public key (`G...`) will be displayed in the Navbar and Wallet Status badge.

### 2. How to Make a Testnet XLM Payment
1. Navigate to the **Payments** page (`/payments`).
2. Enter a valid 56-character Stellar public key destination address (e.g. `GCBAK4S46D2M4S35PXQKZ2O6K6T3237M64Q7WEX4Z2L4XJ5Q4Y7K`).
3. Enter the amount of XLM (e.g. `0.1`).
4. (Optional) Enter a transaction memo and select Memo Type.
5. Click **Submit Payment**.
6. Approve the transaction signature prompt in the Freighter extension popup.
7. Upon confirmation, a green success banner displays the **Transaction Hash** along with a direct **View on StellarExpert Explorer** link.

### 3. How Disconnect Works
1. Navigate to **Wallet** (`/wallet`) or open the **Wallet Modal**.
2. Click **Disconnect Wallet**.
3. All session state, stored public keys, and cached balances are immediately cleared.

---

## 🛡️ Error Handling & Edge Cases

- **User Rejection / Cancellation**: If access or transaction signature is rejected in Freighter, the app catches the rejection without setting connected state and displays an error toast.
- **Unfunded Accounts**: If a newly generated public key is not yet funded on Testnet, an interactive alert banner prompts the user to click **Fund with Friendbot**.
- **Network Mismatch**: If Freighter extension is set to Mainnet (PUBLIC), the application detects the mismatch and prompts the user to switch extension network to Testnet.

---

## 📸 Screenshots (Level 1 Verification)

### 1. Wallet Connected State
![Wallet Connected](docs/screenshots/wallet-connected.png)
*Displays truncated public key (G...), active provider badge, and network indicator.*

### 2. XLM Balance Display
![XLM Balance](docs/screenshots/xlm-balance.png)
*Live account XLM balance queried from Horizon Testnet REST API.*

### 3. Successful Testnet Transaction
![Successful Testnet Transaction](docs/screenshots/transaction-success.png)
*Successful Stellar Testnet XLM payment confirmation displaying the 64-character transaction hash, operation status, and direct StellarExpert Explorer link.*

### 4. Transaction Result & Failure Handling
![Transaction Result](docs/screenshots/transaction-result.png)
*Payment form confirmation and resilient error handling for rejections or invalid transactions.*

---

## 🧪 Development Commands

- **Run Dev Server**: `npm run dev`
- **Type Check**: `npm run typecheck`
- **Run Linter**: `npm run lint`
- **Run Unit Tests**: `npm test`
- **Production Build**: `npm run build`

---

## 📋 Phase Roadmap

- [x] **Phase 0**: Production Frontend Foundation, Design System, Service Abstractions & Route Shells.
- [x] **Level 1 Submission**: Freighter Wallet Integration, Horizon Testnet Balance Sync, Payment Execution, Hash Display & Error Handling.
- [ ] **Level 2 Submission**: Multi-op Payment Batches, Non-custodial Time-locked Escrows & Path Payments.
- [ ] **Level 3 Submission**: Soroban WASM Smart Contract Studio, Contract Deployment & Event Listeners.

---

## 🛡️ License

MIT © StellarPay Pro Team

