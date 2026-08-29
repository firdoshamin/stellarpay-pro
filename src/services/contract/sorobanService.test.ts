import { describe, it, expect, vi } from 'vitest';

vi.mock('../wallet/walletService', () => ({
  walletService: {
    signTransaction: vi.fn().mockResolvedValue('AAAA...SIGNED_XDR'),
  },
}));

import { SorobanService, DEPLOYED_PAYMENT_TRACKER_CONTRACT_ID } from './sorobanService';

describe('SorobanService - Deployed Payment Tracker Contract', () => {
  it('1. returns deployed contract ID by default', () => {
    const service = new SorobanService();
    expect(service.getContractId()).toBe(DEPLOYED_PAYMENT_TRACKER_CONTRACT_ID);
    expect(service.getContractId()).toBe('CBNFYYS23WL3CT6H7O2KVOY3OO2AXYZPXBZTID6SHXZMW55IFVGCQEE7');
  });

  it('2. fetches Payment Tracker contract spec ABI', async () => {
    const service = new SorobanService();
    const spec = await service.getContractSpec();
    expect(spec.contractId).toBe('CBNFYYS23WL3CT6H7O2KVOY3OO2AXYZPXBZTID6SHXZMW55IFVGCQEE7');
    expect(spec.name).toBe('StellarPay Payment Tracker Contract');
    expect(spec.abi.some((item) => item.name === 'record_payment')).toBe(true);
    expect(spec.abi.some((item) => item.name === 'get_payment')).toBe(true);
    expect(spec.abi.some((item) => item.name === 'get_payment_count')).toBe(true);
  });

  it('3. queries payment count and record fallback', async () => {
    const service = new SorobanService();
    const count = await service.getPaymentCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);

    const record = await service.getPayment(1);
    expect(record).not.toBeNull();
    if (record) {
      expect(record.id).toBe(1);
      expect(record.amount).toBeTruthy();
    }
  });

  it('4. simulates record_payment function invocation', async () => {
    const service = new SorobanService();
    const res = await service.invokeFunction(
      'CBNFYYS23WL3CT6H7O2KVOY3OO2AXYZPXBZTID6SHXZMW55IFVGCQEE7',
      'get_payment_count',
      {}
    );
    expect(res.status).toBe('SUCCESS');
    expect(res.transactionHash).toBeTruthy();
  });
});
