# StellarPay Pro 🚀

> Next-Generation Stellar Payments & Soroban Smart Contract dApp designed for Stellar Build Challenge (Level 1, Level 2, and Level 3).

![StellarPay Pro](https://img.shields.io/badge/Stellar-Testnet-00f2fe?style=flat-square&logo=stellar)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

---

## 🌟 Overview

**StellarPay Pro** is a high-performance Web3 payment solution built on top of the Stellar Network and Soroban smart contract ecosystem. Designed with ultra-sleek glassmorphic aesthetics, robust decoupled service architecture, and rich interactive dashboards.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (Strict typing, no `any`)
- **Styling**: Tailwind CSS + Vanilla CSS Glassmorphism + Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Stellar Integration**:
  - `@stellar/stellar-sdk`
  - `@stellar/freighter-api`
  - `@stellar/wallets-kit`
- **Testing**: Vitest + React Testing Library

---

## 📁 Directory Structure

```
src/
├── assets/         # Brand logos, icons, vectors
├── components/     # UI primitives (Button, Card, Modal, Input, Badge, Toast, Spinner)
│   ├── common/     # Navigation (Navbar, Sidebar, MobileNav, Footer)
│   ├── ui/         # Reusable UI component library
│   └── wallet/     # Wallet modals & status indicators
├── constants/      # Network configs, router links, theme presets
├── hooks/          # Custom React hooks (useWallet, useToast, useStellarAccount)
├── layouts/        # MainLayout (Public) & DashboardLayout (App shell)
├── pages/          # Landing, Dashboard, Wallet, Payments, Activity, Campaigns, Contracts, Settings, NotFound
├── services/       # Decoupled blockchain services (Horizon, Wallet connectors, Soroban)
├── store/          # Zustand state stores (Wallet, UI, Network)
├── types/          # Strict TypeScript interface definitions
├── utils/          # Formatting helpers, address truncators, tailwind-merge helper
└── main.tsx        # Application mount entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone or open workspace
cd stellerpay-pro

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will launch automatically at `http://localhost:3000`.

---

## 🧪 Development Commands

- **Run Dev Server**: `npm run dev`
- **Type Check**: `npm run typecheck`
- **Production Build**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Run Tests**: `npm run test`

---

## 📋 Phase Roadmap

- [x] **Phase 0**: Production Frontend Foundation, Design System, Service Abstractions & Route Shells.
- [ ] **Phase 1**: Wallet Integration (Freighter, Albedo, Stellar Wallets Kit), Balance Fetching & Live Testnet Horizon Queries.
- [ ] **Phase 2**: Payment Operations (XLM & Asset transfers, Memo support, Path Payment preview, Transaction signing).
- [ ] **Phase 3**: Soroban Smart Contract Executor (Smart Escrow, Batch Payments, Contract Deployment & Interacting).

---

## 🛡️ License

MIT © StellarPay Pro Team
