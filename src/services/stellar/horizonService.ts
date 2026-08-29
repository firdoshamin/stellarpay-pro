import { AccountDetails, AssetBalance, StellarTransactionRecord } from '../../types/stellar';
import { DEFAULT_NETWORK } from '../../constants/network';

export class HorizonService {
  private horizonUrl: string;

  constructor(horizonUrl = DEFAULT_NETWORK.horizonUrl) {
    this.horizonUrl = horizonUrl;
  }

  setHorizonUrl(url: string): void {
    this.horizonUrl = url;
  }

  async fetchAccount(publicKey: string): Promise<AccountDetails | null> {
    try {
      const response = await fetch(`${this.horizonUrl}/accounts/${publicKey}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Unfunded account
        }
        throw new Error(`Horizon API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Horizon fetch account error:', error);
      return null;
    }
  }

  async fetchAccountBalances(publicKey: string): Promise<AssetBalance[]> {
    const account = await this.fetchAccount(publicKey);
    if (!account || !account.balances) return [];

    return account.balances.map((b) => ({
      code: b.asset_type === 'native' ? 'XLM' : (b.asset_code || b.code || 'UNKNOWN'),
      issuer: b.asset_issuer || b.issuer,
      balance: b.balance,
      buying_liabilities: b.buying_liabilities,
      selling_liabilities: b.selling_liabilities,
      asset_type: b.asset_type,
    }));
  }

  async fetchAccountTransactions(publicKey: string, limit = 10): Promise<StellarTransactionRecord[]> {
    try {
      const response = await fetch(`${this.horizonUrl}/accounts/${publicKey}/transactions?order=desc&limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data._embedded.records || [];
    } catch (error) {
      console.warn('Horizon transactions warning:', error);
      return [];
    }
  }

  async friendbotFund(publicKey: string): Promise<boolean> {
    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const horizonService = new HorizonService();
