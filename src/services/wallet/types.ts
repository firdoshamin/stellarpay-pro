import { WalletType } from '../../types/wallet';

export interface WalletConnectionResult {
  publicKey: string;
  walletType: WalletType;
  networkId: string;
}

export interface IWalletService {
  isInstalled(walletType: WalletType): Promise<boolean>;
  connect(walletType: WalletType): Promise<WalletConnectionResult>;
  disconnect(): Promise<void>;
  signTransaction(xdr: string, opts?: Record<string, unknown>): Promise<string>;
}
