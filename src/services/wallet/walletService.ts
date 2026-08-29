import {
  isConnected,
  requestAccess,
  getPublicKey,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';

import { WalletType } from '../../types/wallet';
import { STELLAR_NETWORKS } from '../../constants/network';
import { useNetworkStore } from '../../store/useNetworkStore';
import {
  IWalletService,
  WalletConnectionResult,
} from './types';

export class WalletService implements IWalletService {
  private activeWalletType: WalletType | null = null;
  private activePublicKey: string | null = null;

  async isInstalled(walletType: WalletType): Promise<boolean> {
    if (walletType !== 'freighter') {
      return false;
    }

    // Direct check for injected window object in browser
    if (typeof window !== 'undefined' && (window as unknown as { freighter?: unknown }).freighter) {
      console.log('[StellarPay WalletService] Freighter detected via window.freighter object.');
      return true;
    }

    try {
      const res = await isConnected();
      console.log('[StellarPay WalletService] isConnected() returned:', res);

      if (typeof res === 'boolean') {
        return res;
      }
      if (res && typeof res === 'object') {
        if ('isConnected' in res) {
          return Boolean((res as { isConnected: boolean }).isConnected);
        }
        if ('error' in res && (res as { error?: string }).error) {
          return false;
        }
        return true; // Any truthy object returned by freighter API implies extension presence
      }
      return Boolean(res);
    } catch (err) {
      console.warn('[StellarPay WalletService] isConnected check threw:', err);
      return false;
    }
  }

  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 30000,
    errorMessage = 'Freighter connection request timed out.'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);

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

    if (walletType !== 'freighter') {
      throw new Error(`Wallet provider "${walletType}" is not supported. Please select Freighter Wallet.`);
    }

    // 1. Check if Freighter extension is detected in browser
    const installed = await this.isInstalled(walletType);
    if (!installed) {
      console.warn('[StellarPay WalletService] Freighter extension NOT installed or NOT detected.');
      throw new Error(
        'Freighter wallet extension not detected in your browser. Please install the official Freighter extension and refresh this page.'
      );
    }

    try {
      // 2. Trigger requestAccess popup in Freighter extension
      console.log('[StellarPay WalletService] Requesting access authorization from Freighter extension...');
      let accessResult: unknown = null;
      try {
        accessResult = await this.withTimeout(
          requestAccess(),
          35000,
          'Freighter connection request timed out. Please unlock your Freighter extension and approve access.'
        );
        console.log('[StellarPay WalletService] requestAccess raw output:', accessResult);
      } catch (reqErr) {
        console.error('[StellarPay WalletService] requestAccess thrown:', reqErr);
        const rawMsg = reqErr instanceof Error ? reqErr.message : String(reqErr);
        if (
          rawMsg.toLowerCase().includes('reject') ||
          rawMsg.toLowerCase().includes('cancel') ||
          rawMsg.toLowerCase().includes('decline') ||
          rawMsg.toLowerCase().includes('user')
        ) {
          throw new Error('Wallet connection request was cancelled or declined in Freighter.');
        }
        throw new Error(`Freighter connection error: ${rawMsg}`);
      }

      let publicKey = '';

      if (typeof accessResult === 'string') {
        const trimmed = accessResult.trim();
        if (trimmed.startsWith('G') && trimmed.length === 56) {
          publicKey = trimmed;
        } else if (
          trimmed.toLowerCase().includes('error') ||
          trimmed.toLowerCase().includes('reject') ||
          trimmed.toLowerCase().includes('cancel') ||
          trimmed.toLowerCase().includes('decline')
        ) {
          throw new Error(`Freighter authorization rejected: ${trimmed}`);
        }
      } else if (accessResult && typeof accessResult === 'object') {
        const resObj = accessResult as { address?: string; publicKey?: string; error?: string };
        if (resObj.error) {
          throw new Error(`Freighter authorization rejected: ${resObj.error}`);
        }
        publicKey = resObj.address || resObj.publicKey || '';
      }

      // Fallback: If requestAccess did not return public key string directly, call getPublicKey()
      if (!publicKey || !publicKey.startsWith('G') || publicKey.length !== 56) {
        console.log('[StellarPay WalletService] Calling getPublicKey() fallback...');
        try {
          const pkResult = await getPublicKey();
          console.log('[StellarPay WalletService] getPublicKey() raw output:', pkResult);
          if (typeof pkResult === 'string') {
            const trimmedPk = pkResult.trim();
            if (trimmedPk.startsWith('G') && trimmedPk.length === 56) {
              publicKey = trimmedPk;
            }
          } else if (pkResult && typeof pkResult === 'object') {
            const pkObj = pkResult as { address?: string; publicKey?: string };
            const candidate = pkObj.address || pkObj.publicKey || '';
            if (candidate.startsWith('G') && candidate.length === 56) {
              publicKey = candidate;
            }
          }
        } catch (pkErr) {
          console.warn('[StellarPay WalletService] Fallback getPublicKey failed:', pkErr);
        }
      }

      // STRICT VALIDATION: Must be a valid 56-character Ed25519 key starting with 'G'
      if (!publicKey || typeof publicKey !== 'string' || !publicKey.startsWith('G') || publicKey.length !== 56) {
        console.error('[StellarPay WalletService] Invalid or missing public key after authorization:', publicKey);
        throw new Error('Connection failed: No valid Stellar public key (56 characters starting with G) was returned by Freighter.');
      }

      console.log(`[StellarPay WalletService] Successfully retrieved public key: ${publicKey}`);

      // 3. Network Check: ensure user is not on Mainnet PUBLIC when app expects Testnet
      try {
        const netRes = await getNetwork();
        console.log('[StellarPay WalletService] Detected Freighter Network:', netRes);
        let netName = '';
        if (typeof netRes === 'string') {
          netName = netRes;
        } else if (netRes && typeof netRes === 'object') {
          netName = (netRes as { network?: string }).network || '';
        }

        if (netName && netName.toUpperCase() === 'PUBLIC') {
          throw new Error('Freighter is currently connected to Stellar Mainnet (PUBLIC). Please switch your Freighter extension network to Testnet.');
        }
      } catch (netErr) {
        if (netErr instanceof Error && netErr.message.includes('switch your Freighter')) {
          throw netErr;
        }
        console.warn('[StellarPay WalletService] Network check non-blocking warning:', netErr);
      }

      this.activeWalletType = walletType;
      this.activePublicKey = publicKey;

      return {
        publicKey,
        walletType,
        networkId: 'testnet',
      };
    } catch (error) {
      this.activeWalletType = null;
      this.activePublicKey = null;

      console.error('[StellarPay WalletService] Connection failed:', error);
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Unable to complete connection to Freighter.');
    }
  }

  async disconnect(): Promise<void> {
    console.log('[StellarPay WalletService] Clearing active wallet session.');
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

    console.log('[StellarPay WalletService] Requesting transaction signature via Freighter...');
    try {
      const activePassphrase = useNetworkStore.getState().currentNetwork.passphrase || STELLAR_NETWORKS.testnet.passphrase;

      const signedRes = await signTransaction(xdr, {
        networkPassphrase: activePassphrase,
        accountToSign: this.activePublicKey,
        ...opts,
      });

      console.log('[StellarPay WalletService] Transaction signature response received.');

      let signedXdr = '';
      if (typeof signedRes === 'string') {
        signedXdr = signedRes;
      } else if (signedRes && typeof signedRes === 'object') {
        const signedObj = signedRes as { signedTxXdr?: string; error?: string };
        if (signedObj.error) {
          throw new Error(signedObj.error);
        }
        signedXdr = signedObj.signedTxXdr || '';
      }

      if (!signedXdr || typeof signedXdr !== 'string') {
        throw new Error('Transaction signing was cancelled or failed.');
      }

      return signedXdr;
    } catch (error) {
      console.error('[StellarPay WalletService] signTransaction error:', error);
      if (error instanceof Error) {
        if (
          error.message.toLowerCase().includes('reject') ||
          error.message.toLowerCase().includes('cancel') ||
          error.message.toLowerCase().includes('decline') ||
          error.message.toLowerCase().includes('user')
        ) {
          throw new Error('Transaction signing was cancelled in Freighter extension.');
        }
        throw error;
      }

      throw new Error('Transaction signing failed in Freighter.');
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
      if (!installed) {
        return null;
      }

      console.log('[StellarPay WalletService] Checking existing connection via getPublicKey()...');
      const pkResult = await getPublicKey();
      let publicKey = '';

      if (typeof pkResult === 'string') {
        const trimmed = pkResult.trim();
        if (trimmed.startsWith('G') && trimmed.length === 56) {
          publicKey = trimmed;
        }
      } else if (pkResult && typeof pkResult === 'object') {
        const pkObj = pkResult as { address?: string; publicKey?: string };
        const candidate = (pkObj.address || pkObj.publicKey || '').trim();
        if (candidate.startsWith('G') && candidate.length === 56) {
          publicKey = candidate;
        }
      }

      if (publicKey) {
        console.log('[StellarPay WalletService] Restored active session key:', publicKey);
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