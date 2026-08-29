import { describe, it, expect } from 'vitest';
import {
  WalletErrorCategory,
  AppWalletError,
  WalletNotFoundError,
  UserRejectedError,
  InsufficientBalanceError,
} from '../types/errors';
import { normalizeWalletError, validateSufficientBalance } from './errorNormalizer';

describe('Level 2 Error Classification Engine', () => {
  it('1. classifies wallet unavailable error as WalletNotFound', () => {
    const err = new WalletNotFoundError('Rabet');
    expect(err).toBeInstanceOf(AppWalletError);
    expect(err.category).toBe(WalletErrorCategory.WalletNotFound);
    expect(err.message).toContain('Wallet Not Found');
    expect(err.message).toContain('Rabet');

    const normalized = normalizeWalletError('Rabet wallet is not installed in browser', 'Rabet');
    expect(normalized.category).toBe(WalletErrorCategory.WalletNotFound);
  });

  it('2. classifies user cancellation/rejection as UserRejected', () => {
    const err = new UserRejectedError('transaction signature');
    expect(err).toBeInstanceOf(AppWalletError);
    expect(err.category).toBe(WalletErrorCategory.UserRejected);
    expect(err.message).toContain('Transaction Cancelled');

    const normalizedFromStr = normalizeWalletError('User rejected the request in Freighter');
    expect(normalizedFromStr.category).toBe(WalletErrorCategory.UserRejected);

    const normalizedFromCancel = normalizeWalletError('User cancelled the authorization pop-up');
    expect(normalizedFromCancel.category).toBe(WalletErrorCategory.UserRejected);
  });

  it('3. classifies insufficient balance error as InsufficientBalance', () => {
    const err = new InsufficientBalanceError('100.0000100', '10.5000000');
    expect(err).toBeInstanceOf(AppWalletError);
    expect(err.category).toBe(WalletErrorCategory.InsufficientBalance);
    expect(err.requiredAmount).toBe('100.0000100');
    expect(err.availableAmount).toBe('10.5000000');
    expect(err.message).toContain('Insufficient Balance');

    expect(() => validateSufficientBalance(50, 10)).toThrow('Insufficient Balance');
    expect(() => validateSufficientBalance(10, 50)).not.toThrow();
  });

  it('4. safely classifies unknown errors as Generic/Unknown', () => {
    const normalized = normalizeWalletError(new Error('Network connection reset by peer'));
    expect(normalized.category).toBe(WalletErrorCategory.Unknown);
    expect(normalized.message).toBe('Network connection reset by peer');
  });
});
