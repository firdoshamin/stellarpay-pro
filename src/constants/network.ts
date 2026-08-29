export interface NetworkConfig {
  id: string;
  name: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  passphrase: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export const STELLAR_NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    id: 'testnet',
    name: 'Stellar Testnet',
    horizonUrl: import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    passphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    isTestnet: true,
  },
  futurenet: {
    id: 'futurenet',
    name: 'Stellar Futurenet',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    sorobanRpcUrl: 'https://rpc-futurenet.stellar.org',
    passphrase: 'Test SDF Future Network ; October 2022',
    explorerUrl: 'https://stellar.expert/explorer/futurenet',
    isTestnet: true,
  },
};

export const DEFAULT_NETWORK = STELLAR_NETWORKS.testnet;
