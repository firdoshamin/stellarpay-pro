import {
  WalletErrorCategory,
  AppWalletError,
  WalletNotFoundError,
  UserRejectedError,
  InsufficientBalanceError,
} from '../types/errors';

export function normalizeWalletError(err: unknown, contextProvider = 'Wallet'): AppWalletError {
  if (err instanceof AppWalletError) {
    return err;
  }

  const rawMsg = err instanceof Error ? err.message : String(err || '');
  const lowerMsg = rawMsg.toLowerCase();

  // 1. User Rejection / Cancellation
  if (
    lowerMsg.includes('reject') ||
    lowerMsg.includes('cancel') ||
    lowerMsg.includes('decline') ||
    lowerMsg.includes('user denied') ||
    lowerMsg.includes('user rejected') ||
    lowerMsg.includes('user cancelled') ||
    lowerMsg.includes('user canceled')
  ) {
    return new UserRejectedError();
  }

  // 2. Wallet Not Found / Unavailable
  if (
    lowerMsg.includes('not installed') ||
    lowerMsg.includes('unavailable') ||
    lowerMsg.includes('not detected') ||
    lowerMsg.includes('not found') ||
    lowerMsg.includes('missing')
  ) {
    return new WalletNotFoundError(contextProvider);
  }

  // 3. Insufficient Balance
  if (
    lowerMsg.includes('insufficient') ||
    lowerMsg.includes('underfunded') ||
    lowerMsg.includes('low balance') ||
    lowerMsg.includes('not enough xlm')
  ) {
    return new AppWalletError(WalletErrorCategory.InsufficientBalance, rawMsg);
  }

  return new AppWalletError(WalletErrorCategory.Unknown, rawMsg || 'An unknown error occurred.');
}

export function validateSufficientBalance(
  requestedAmount: number,
  availableBalance: number,
  fee = 0.00001
): void {
  const totalRequired = requestedAmount + fee;
  if (availableBalance < totalRequired) {
    throw new InsufficientBalanceError(
      totalRequired.toFixed(7),
      availableBalance.toFixed(7)
    );
  }
}
