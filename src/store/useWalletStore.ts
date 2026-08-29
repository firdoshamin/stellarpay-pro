import { create } from 'zustand';
import { WalletStatus, WalletType } from '../types/wallet';
import { AssetBalance } from '../types/stellar';
import { walletService } from '../services/wallet/walletService';
import { horizonService } from '../services/stellar/horizonService';

interface WalletStoreState {
  publicKey: string | null;
  walletType: WalletType | null;
  status: WalletStatus;
  balances: AssetBalance[];
  isLoadingBalances: boolean;
  error: string | null;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  initWalletSession: () => Promise<void>;
  setPublicKey: (key: string | null) => void;
}

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  publicKey: null,
  walletType: null,
  status: 'disconnected',
  balances: [],
  isLoadingBalances: false,
  error: null,

  connect: async (walletType: WalletType) => {
    console.log(`[StellarPay Store] Initiating connect via ${walletType}...`);
    set({ status: 'connecting', error: null });
    try {
      const res = await walletService.connect(walletType);
      if (!res || !res.publicKey || !res.publicKey.startsWith('G') || res.publicKey.length !== 56) {
        throw new Error('No valid 56-character Stellar public key (G...) was returned by wallet.');
      }

      console.log(`[StellarPay Store] Successfully connected. Public Key: ${res.publicKey}`);
      set({
        publicKey: res.publicKey,
        walletType: res.walletType,
        status: 'connected',
        error: null,
      });
      await get().refreshBalances();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error('[StellarPay Store] Connect error:', errorMsg);
      set({
        publicKey: null,
        walletType: null,
        status: 'disconnected',
        balances: [],
        error: errorMsg,
      });
      throw err;
    }
  },

  disconnect: async () => {
    console.log('[StellarPay Store] Disconnecting wallet...');
    await walletService.disconnect();
    set({
      publicKey: null,
      walletType: null,
      status: 'disconnected',
      balances: [],
      error: null,
    });
  },

  refreshBalances: async () => {
    const { publicKey, status } = get();
    if (!publicKey || status !== 'connected') return;
    set({ isLoadingBalances: true });
    try {
      console.log(`[StellarPay Store] Fetching account balances for key: ${publicKey}`);
      const balances = await horizonService.fetchAccountBalances(publicKey);
      console.log('[StellarPay Store] Received account balances:', balances);
      set({ balances, isLoadingBalances: false });
    } catch (err) {
      console.warn('[StellarPay Store] refreshBalances error:', err);
      set({ isLoadingBalances: false });
    }
  },

  initWalletSession: async () => {
    console.log('[StellarPay Store] Initializing wallet session...');
    try {
      const res = await walletService.checkExistingConnection();
      if (res && res.publicKey && res.publicKey.startsWith('G') && res.publicKey.length === 56) {
        console.log(`[StellarPay Store] Restored existing session with key: ${res.publicKey}`);
        set({
          publicKey: res.publicKey,
          walletType: res.walletType,
          status: 'connected',
          error: null,
        });
        await get().refreshBalances();
      } else {
        console.log('[StellarPay Store] No pre-existing active wallet authorization.');
        set({
          publicKey: null,
          walletType: null,
          status: 'disconnected',
          balances: [],
        });
      }
    } catch (err) {
      console.warn('[StellarPay Store] initWalletSession error:', err);
      set({
        publicKey: null,
        walletType: null,
        status: 'disconnected',
        balances: [],
      });
    }
  },

  setPublicKey: (key: string | null) => {
    if (key && key.startsWith('G') && key.length === 56) {
      set({
        publicKey: key,
        status: 'connected',
      });
    } else {
      set({
        publicKey: null,
        status: 'disconnected',
      });
    }
  },
}));
