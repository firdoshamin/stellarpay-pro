import {
  isConnected,
  requestAccess,
  getPublicKey,
  getNetwork,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';

import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule, ALBEDO_ID } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule, XBULL_ID } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { RabetModule, RABET_ID } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { LobstrModule, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { HanaModule, HANA_ID } from '@creit.tech/stellar-wallets-kit/modules/hana';

import { WalletType } from '../../types/wallet';
import { STELLAR_NETWORKS } from '../../constants/network';
import { useNetworkStore } from '../../store/useNetworkStore';
import {
  IWalletService,
  WalletConnectionResult,
} from './types';

const WALLET_MODULE_IDS: Record<string, string> = {
  freighter: FREIGHTER_ID,
  albedo: ALBEDO_ID,
  xbull: XBULL_ID,
  rabet: RABET_ID,
  lobstr: LOBSTR_ID,
  hana: HANA_ID,
};

export class WalletService implements IWalletService {
  private activeWalletType: WalletType | null = null;
  private activePublicKey: string | null = null;
  private isKitInitialized = false;

  private initKit(): void {
    if (typeof window === 'undefined' || this.isKitInitialized) return;
    try {
      console.log('[StellarPay WalletService] Initializing StellarWalletsKit v2.5.0...');
      StellarWalletsKit.init({
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
          new RabetModule(),
          new LobstrModule(),
          new HanaModule(),
        ],
        network: Networks.TESTNET,
      });
      this.isKitInitialized = true;
      console.log('[StellarPay WalletService] StellarWalletsKit initialized successfully.');
    } catch (err) {
      console.warn('[StellarPay WalletService] StellarWalletsKit init error:', err);
    }
  }

  async isInstalled(walletType: WalletType): Promise<boolean> {
    if (walletType === 'freighter') {
      if (typeof window !== 'undefined' && (window as unknown as { freighter?: unknown }).freighter) {
        return true;
      }
      try {
        const res = await isConnected();
        if (typeof res === 'boolean') return res;
        if (res && typeof res === 'object') {
          if ('isConnected' in res) return Boolean((res as { isConnected: boolean }).isConnected);
          if ('error' in res && (res as { error?: string }).error) return false;
          return true;
        }
        return Boolean(res);
      } catch {
        return false;
      }
    }

    if (walletType === 'albedo') {
      // Albedo is web-popup based, available on all modern web browsers
      return true;
    }

    if (walletType === 'xbull') {
      return typeof window !== 'undefined' && Boolean((window as unknown as { xBull?: unknown }).xBull);
    }

    if (walletType === 'rabet') {
      return typeof window !== 'undefined' && Boolean((window as unknown as { rabet?: unknown }).rabet);
    }

    if (walletType === 'hana') {
      return typeof window !== 'undefined' && Boolean((window as unknown as { hana?: unknown }).hana);
    }

    if (walletType === 'lobstr') {
      return typeof window !== 'undefined' && Boolean((window as unknown as { lobstr?: unknown }).lobstr);
    }

    return false;
  }

  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 35000,
    errorMessage = 'Wallet connection request timed out.'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async connect(walletType: WalletType): Promise<WalletConnectionResult> {
    console.log(`[StellarPay WalletService] connect() called with walletType="${walletType}"`);

    // 1. Direct Freighter connection path (Level 1 baseline)
    if (walletType === 'freighter') {
      const installed = await this.isInstalled('freighter');
      if (!installed) {
        throw new Error('Freighter wallet extension not detected in your browser. Please install the official Freighter extension and refresh this page.');
      }

      try {
        console.log('[StellarPay WalletService] Triggering Freighter requestAccess()...');
        const accessResult = await this.withTimeout(
          requestAccess(),
          35000,
          'Freighter connection request timed out. Please unlock your Freighter extension and approve access.'
        );

        let publicKey = '';
        if (typeof accessResult === 'string') {
          const trimmed = accessResult.trim();
          if (trimmed.startsWith('G') && trimmed.length === 56) {
            publicKey = trimmed;
          } else if (trimmed.toLowerCase().includes('reject') || trimmed.toLowerCase().includes('cancel') || trimmed.toLowerCase().includes('decline')) {
            throw new Error('Wallet connection request was cancelled or declined in Freighter.');
          }
        } else if (accessResult && typeof accessResult === 'object') {
          const resObj = accessResult as { address?: string; publicKey?: string; error?: string };
          if (resObj.error) {
            throw new Error(`Freighter authorization rejected: ${resObj.error}`);
          }
          publicKey = resObj.address || resObj.publicKey || '';
        }

        if (!publicKey || !publicKey.startsWith('G') || publicKey.length !== 56) {
          const pkResult = await getPublicKey();
          if (typeof pkResult === 'string' && pkResult.trim().startsWith('G') && pkResult.trim().length === 56) {
            publicKey = pkResult.trim();
          } else if (pkResult && typeof pkResult === 'object') {
            const candidate = ((pkResult as { address?: string; publicKey?: string }).address || (pkResult as { address?: string; publicKey?: string }).publicKey || '').trim();
            if (candidate.startsWith('G') && candidate.length === 56) {
              publicKey = candidate;
            }
          }
        }

        if (!publicKey || !publicKey.startsWith('G') || publicKey.length !== 56) {
          throw new Error('Connection failed: No valid Stellar public key (56 characters starting with G) was returned by Freighter.');
        }

        try {
          const netRes = await getNetwork();
          const netName = typeof netRes === 'string' ? netRes : (netRes as { network?: string })?.network || '';
          if (netName && netName.toUpperCase() === 'PUBLIC') {
            throw new Error('Freighter is currently connected to Stellar Mainnet (PUBLIC). Please switch your Freighter extension network to Testnet.');
          }
        } catch (netErr) {
          if (netErr instanceof Error && netErr.message.includes('switch your Freighter')) {
            throw netErr;
          }
        }

        this.activeWalletType = 'freighter';
        this.activePublicKey = publicKey;
        return { publicKey, walletType: 'freighter', networkId: 'testnet' };
      } catch (error) {
        this.activeWalletType = null;
        this.activePublicKey = null;
        if (error instanceof Error) throw error;
        throw new Error('Unable to complete connection to Freighter.');
      }
    }

    // 2. Multi-Wallet Integration via StellarWalletsKit (Albedo, xBull, Rabet, Lobstr, Hana)
    const moduleId = WALLET_MODULE_IDS[walletType];
    if (!moduleId) {
      throw new Error(`Wallet provider "${walletType}" is not supported.`);
    }

    const available = await this.isInstalled(walletType);
    if (!available) {
      throw new Error(`Wallet provider "${walletType.toUpperCase()}" is not installed or available in your browser.`);
    }

    try {
      this.initKit();
      console.log(`[StellarPay WalletService] Connecting via StellarWalletsKit moduleId="${moduleId}"...`);
      StellarWalletsKit.setWallet(moduleId);
      StellarWalletsKit.setNetwork(Networks.TESTNET);

      const res = await this.withTimeout(
        StellarWalletsKit.fetchAddress(),
        45000,
        `${walletType.toUpperCase()} wallet request timed out.`
      );

      const publicKey = (res?.address || '').trim();
      if (!publicKey || !publicKey.startsWith('G') || publicKey.length !== 56) {
        throw new Error(`Connection failed: No valid Ed25519 public key (G...) returned by ${walletType.toUpperCase()}.`);
      }

      this.activeWalletType = walletType;
      this.activePublicKey = publicKey;
      console.log(`[StellarPay WalletService] Connected ${walletType} with key: ${publicKey}`);

      return {
        publicKey,
        walletType,
        networkId: 'testnet',
      };
    } catch (err) {
      this.activeWalletType = null;
      this.activePublicKey = null;
      console.error(`[StellarPay WalletService] StellarWalletsKit connect error for ${walletType}:`, err);
      if (err instanceof Error) throw err;
      throw new Error(`Failed to connect to ${walletType}.`);
    }
  }

  async disconnect(): Promise<void> {
    console.log('[StellarPay WalletService] Disconnecting active wallet session.');
    if (this.isKitInitialized) {
      try {
        await StellarWalletsKit.disconnect();
      } catch (err) {
        console.warn('[StellarPay WalletService] Kit disconnect non-blocking warning:', err);
      }
    }
    this.activeWalletType = null;
    this.activePublicKey = null;
  }

  async signTransaction(
    xdr: string,
    opts?: Record<string, unknown>
  ): Promise<string> {
    if (!this.activePublicKey) {
      throw new Error('No wallet connected.');
    }

    const activePassphrase = useNetworkStore.getState().currentNetwork.passphrase || STELLAR_NETWORKS.testnet.passphrase;

    // Use direct native Freighter signing if Freighter is active
    if (this.activeWalletType === 'freighter') {
      console.log('[StellarPay WalletService] Signing transaction via native Freighter...');
      try {
        const signedRes = await freighterSignTransaction(xdr, {
          networkPassphrase: activePassphrase,
          accountToSign: this.activePublicKey,
          ...opts,
        });

        let signedXdr = '';
        if (typeof signedRes === 'string') {
          signedXdr = signedRes;
        } else if (signedRes && typeof signedRes === 'object') {
          const signedObj = signedRes as { signedTxXdr?: string; error?: string };
          if (signedObj.error) throw new Error(signedObj.error);
          signedXdr = signedObj.signedTxXdr || '';
        }

        if (!signedXdr || typeof signedXdr !== 'string') {
          throw new Error('Transaction signing was cancelled or failed.');
        }

        return signedXdr;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('reject') || error.message.toLowerCase().includes('cancel')) {
            throw new Error('Transaction signing was cancelled in Freighter extension.');
          }
          throw error;
        }
        throw new Error('Transaction signing failed in Freighter.');
      }
    }

    // Multi-wallet signing via StellarWalletsKit
    console.log(`[StellarPay WalletService] Signing transaction via StellarWalletsKit for ${this.activeWalletType}...`);
    try {
      this.initKit();
      const res = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: activePassphrase,
        address: this.activePublicKey,
      });

      if (!res || !res.signedTxXdr) {
        throw new Error('Transaction signing was cancelled or produced no XDR output.');
      }

      return res.signedTxXdr;
    } catch (err) {
      console.error('[StellarPay WalletService] StellarWalletsKit signTransaction error:', err);
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('reject') || err.message.toLowerCase().includes('cancel')) {
          throw new Error(`Transaction signing was cancelled in ${this.activeWalletType?.toUpperCase()}.`);
        }
        throw err;
      }
      throw new Error(`Transaction signing failed in ${this.activeWalletType?.toUpperCase()}.`);
    }
  }

  getActivePublicKey(): string | null {
    return this.activePublicKey;
  }

  getActiveWalletType(): WalletType | null {
    return this.activeWalletType;
  }

  async checkExistingConnection(): Promise<WalletConnectionResult | null> {
    try {
      const installed = await this.isInstalled('freighter');
      if (!installed) return null;

      const pkResult = await getPublicKey();
      let publicKey = '';
      if (typeof pkResult === 'string' && pkResult.trim().startsWith('G') && pkResult.trim().length === 56) {
        publicKey = pkResult.trim();
      } else if (pkResult && typeof pkResult === 'object') {
        const candidate = ((pkResult as { address?: string; publicKey?: string }).address || (pkResult as { address?: string; publicKey?: string }).publicKey || '').trim();
        if (candidate.startsWith('G') && candidate.length === 56) {
          publicKey = candidate;
        }
      }

      if (publicKey) {
        this.activeWalletType = 'freighter';
        this.activePublicKey = publicKey;
        return {
          publicKey,
          walletType: 'freighter',
          networkId: 'testnet',
        };
      }
    } catch (err) {
      console.log('[StellarPay WalletService] Session check silent catch:', err);
    }
    return null;
  }
}

export const walletService = new WalletService();