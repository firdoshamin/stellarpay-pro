export interface PaymentRecord {
  id: number;
  sender: string;
  recipient: string;
  amount: string; // formatted in XLM units
  rawAmount: string; // stroops i128
  memo: string;
  timestamp: number;
}

export type ContractCallStage =
  | 'idle'
  | 'preparing'
  | 'awaiting_signature'
  | 'submitting'
  | 'success'
  | 'failed';

export interface SorobanContractSpec {
  id: string;
  name: string;
  contractId: string;
  network: string;
  abi: SorobanFunctionAbi[];
  description?: string;
  createdAt: string;
}

export interface SorobanFunctionAbi {
  name: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ type: string }>;
  docs?: string;
}

export interface ContractInvocationResult {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionHash?: string;
  resultValue?: string;
  errorMessage?: string;
  paymentId?: number;
  contractId?: string;
  explorerUrl?: string;
}
