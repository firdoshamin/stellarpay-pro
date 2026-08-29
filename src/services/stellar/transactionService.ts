import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';
import { walletService } from '../wallet/walletService';
import { STELLAR_NETWORKS } from '../../constants/network';
import { useNetworkStore } from '../../store/useNetworkStore';

export interface SendPaymentParams {
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: 'MEMO_TEXT' | 'MEMO_ID';
}

export interface PaymentResult {
  successful: boolean;
  hash: string;
  ledger?: number;
}

import { validateSufficientBalance } from '../../utils/errorNormalizer';

export class TransactionService {
  private horizonUrl: string | null = null;

  constructor(horizonUrl: string | null = null) {
    this.horizonUrl = horizonUrl;
  }

  setHorizonUrl(url: string): void {
    this.horizonUrl = url;
  }

  async sendPayment(params: SendPaymentParams): Promise<PaymentResult> {
    const {
      sourcePublicKey,
      destinationPublicKey,
      amount,
      assetCode = 'XLM',
      assetIssuer,
      memo,
      memoType = 'MEMO_TEXT',
    } = params;

    const currentNetwork = useNetworkStore.getState().currentNetwork;
    const activeHorizonUrl = this.horizonUrl || currentNetwork.horizonUrl;
    const activePassphrase = currentNetwork.passphrase || STELLAR_NETWORKS.testnet.passphrase;

    const server = new Horizon.Server(activeHorizonUrl);

    // 1. Fetch account from Horizon
    let account;
    try {
      account = await server.loadAccount(sourcePublicKey);
    } catch {
      throw new Error(
        `Source account is not active on ${currentNetwork.name}. Please fund your account with Friendbot first.`
      );
    }

    // 2. Validate XLM balance if transferring native asset
    if (assetCode === 'XLM' || !assetCode) {
      const nativeBalanceRecord = account.balances.find((b: { asset_type: string }) => b.asset_type === 'native');
      const availableXlm = parseFloat(nativeBalanceRecord?.balance || '0');
      const requestedXlm = parseFloat(amount);
      validateSufficientBalance(requestedXlm, availableXlm, 0.00001);
    }

    // 2. Build payment operation
    let paymentAsset: Asset;
    if (assetCode === 'XLM' || !assetCode) {
      paymentAsset = Asset.native();
    } else if (assetIssuer) {
      paymentAsset = new Asset(assetCode, assetIssuer);
    } else if (assetCode === 'USDC') {
      // Standard Testnet USDC issuer fallback
      paymentAsset = new Asset('USDC', 'GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TWVCGXGK3OO2CVB');
    } else {
      paymentAsset = Asset.native();
    }

    const txBuilder = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: activePassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: paymentAsset,
          amount: amount,
        })
      )
      .setTimeout(30);

    if (memo && memo.trim()) {
      if (memoType === 'MEMO_ID') {
        txBuilder.addMemo(Memo.id(memo.trim()));
      } else {
        txBuilder.addMemo(Memo.text(memo.trim()));
      }
    }

    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();

    // 3. Request Freighter signature
    let signedXdr = '';
    try {
      signedXdr = await walletService.signTransaction(xdr, { networkPassphrase: activePassphrase });
    } catch (signErr) {
      if (signErr instanceof Error && (
        signErr.message.toLowerCase().includes('reject') ||
        signErr.message.toLowerCase().includes('cancel') ||
        signErr.message.toLowerCase().includes('user') ||
        signErr.message.toLowerCase().includes('declined')
      )) {
        throw new Error('Transaction cancelled');
      }
      throw signErr;
    }

    if (!signedXdr) {
      throw new Error('Transaction cancelled');
    }

    // 4. Submit signed transaction to Horizon
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      activePassphrase
    );
    const result = await server.submitTransaction(signedTx);

    return {
      successful: true,
      hash: result.hash,
      ledger: result.ledger,
    };
  }
}

export const transactionService = new TransactionService();

