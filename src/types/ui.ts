export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type ModalId = 'wallet_connect' | 'send_payment' | 'account_qr' | 'network_switch' | null;
