import { useWalletStore } from '../store/useWalletStore';

export function useWallet() {
  const {
    publicKey,
    walletType,
    status,
    balances,
    isLoadingBalances,
    error,
    connect,
    disconnect,
    refreshBalances,
  } = useWalletStore();

  return {
    publicKey,
    walletType,
    status,
    isConnected: status === 'connected' && !!publicKey,
    isConnecting: status === 'connecting',
    balances,
    isLoadingBalances,
    error,
    connect,
    disconnect,
    refreshBalances,
  };
}
