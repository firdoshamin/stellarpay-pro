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
}
