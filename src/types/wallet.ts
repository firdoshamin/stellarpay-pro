export type WalletType = 'freighter' | 'albedo' | 'xbull' | 'lobstr' | 'secret_key';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletState {
  publicKey: string | null;
  walletType: WalletType | null;
  status: WalletStatus;
  error: string | null;
  networkId: string;
}

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  downloadUrl?: string;
}
