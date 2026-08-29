import { describe, it, expect } from 'vitest';
import { SorobanService } from './sorobanService';

describe('SorobanService - Payment Tracker Contract Interface', () => {
  it('initializes with default RPC URL and allows updating', () => {
    const service = new SorobanService('https://soroban-testnet.stellar.org');
    expect(service.getRpcUrl()).toBe('https://soroban-testnet.stellar.org');

    service.setRpcUrl('https://rpc-futurenet.stellar.org');
    expect(service.getRpcUrl()).toBe('https://rpc-futurenet.stellar.org');
  });

  it('fetches Payment Tracker contract spec ABI', async () => {
    const service = new SorobanService();
    const spec = await service.getContractSpec('CPAIMENTTRACKER123');
    expect(spec.contractId).toBe('CPAIMENTTRACKER123');
    expect(spec.name).toBe('StellarPay Payment Tracker Contract');
    expect(spec.abi.some((item) => item.name === 'record_payment')).toBe(true);
    expect(spec.abi.some((item) => item.name === 'get_payment')).toBe(true);
    expect(spec.abi.some((item) => item.name === 'get_payment_count')).toBe(true);
  });

  it('simulates record_payment function invocation', async () => {
    const service = new SorobanService();
    const res = await service.invokeFunction('CPAIMENTTRACKER123', 'record_payment', {
      from: 'G...',
      to: 'G...',
      amount: '50000000',
      memo: 'Invoice #1',
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.transactionHash).toBeTruthy();
  });
});
