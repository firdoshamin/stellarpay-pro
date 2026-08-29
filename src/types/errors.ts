export enum WalletErrorCategory {
  WalletNotFound = 'WalletNotFound',
  UserRejected = 'UserRejected',
  InsufficientBalance = 'InsufficientBalance',
  Unknown = 'Unknown',
}

export class AppWalletError extends Error {
  public readonly category: WalletErrorCategory;

  constructor(category: WalletErrorCategory, message: string) {
    super(message);
    this.name = 'AppWalletError';
    this.category = category;
    Object.setPrototypeOf(this, AppWalletError.prototype);
  }
}

export class WalletNotFoundError extends AppWalletError {
  constructor(walletName: string) {
    super(
      WalletErrorCategory.WalletNotFound,
      `Wallet Not Found — The selected wallet (${walletName}) is not installed or unavailable in your browser.`
    );
  }
}

export class UserRejectedError extends AppWalletError {
  constructor(action = 'request') {
    super(
      WalletErrorCategory.UserRejected,
      `Transaction Cancelled — You rejected the ${action} in your wallet.`
    );
  }
}

export class InsufficientBalanceError extends AppWalletError {
  public readonly requiredAmount: string;
  public readonly availableAmount: string;

  constructor(requiredAmount: string, availableAmount: string) {
    super(
      WalletErrorCategory.InsufficientBalance,
      `Insufficient Balance — Required: ${requiredAmount} XLM, Available: ${availableAmount} XLM.`
    );
    this.requiredAmount = requiredAmount;
    this.availableAmount = availableAmount;
  }
}
