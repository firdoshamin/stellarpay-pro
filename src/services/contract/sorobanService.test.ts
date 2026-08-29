import { describe, it, expect } from 'vitest';
import { SorobanService } from './sorobanService';

describe('SorobanService', () => {
  it('initializes with default RPC URL and allows updating', () => {
    const service = new SorobanService('https://soroban-testnet.stellar.org');
    expect(service.getRpcUrl()).toBe('https://soroban-testnet.stellar.org');

    service.setRpcUrl('https://rpc-futurenet.stellar.org');
    expect(service.getRpcUrl()).toBe('https://rpc-futurenet.stellar.org');
  });

  it('fetches contract spec stub', async () => {
    const service = new SorobanService();
    const spec = await service.getContractSpec('CCONTRACT123');
    expect(spec.contractId).toBe('CCONTRACT123');
    expect(spec.abi.length).toBeGreaterThan(0);
  });

  it('simulates contract function invocation', async () => {
    const service = new SorobanService();
    const res = await service.invokeFunction('CCONTRACT123', 'deposit_escrow', { amount: '100' });
    expect(res.status).toBe('SUCCESS');
    expect(res.transactionHash).toBeTruthy();
  });
});
