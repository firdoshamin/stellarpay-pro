import { create } from 'zustand';
import { DEFAULT_NETWORK, NetworkConfig, STELLAR_NETWORKS } from '../constants/network';
import { horizonService } from '../services/stellar/horizonService';
import { sorobanService } from '../services/contract/sorobanService';
import { transactionService } from '../services/stellar/transactionService';

interface NetworkStoreState {
  currentNetwork: NetworkConfig;
  setNetwork: (networkId: string) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  currentNetwork: DEFAULT_NETWORK,
  setNetwork: (networkId: string) => {
    const net = STELLAR_NETWORKS[networkId] || DEFAULT_NETWORK;
    horizonService.setHorizonUrl(net.horizonUrl);
    sorobanService.setRpcUrl(net.sorobanRpcUrl);
    transactionService.setHorizonUrl(net.horizonUrl);
    set({ currentNetwork: net });
  },
}));

