export interface PaymentFormValues {
  destination: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';
}

export interface PaymentHistoryItem {
  id: string;
  type: 'send' | 'receive' | 'path_payment' | 'contract_transfer';
  sender: string;
  recipient: string;
  amount: string;
  assetCode: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
  memo?: string;
}
