/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK?: string;
  readonly VITE_STELLAR_HORIZON_URL?: string;
  readonly VITE_STELLAR_NETWORK_PASSPHRASE?: string;
  readonly VITE_SOROBAN_RPC_URL?: string;
  readonly VITE_PAYMENT_TRACKER_CONTRACT_ID?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_ENABLE_SOROBAN_CONTRACTS?: string;
  readonly VITE_ENABLE_BATCH_PAYMENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
