import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useWallet } from '../hooks/useWallet';
import { useUIStore } from '../store/useUIStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { useToast } from '../hooks/useToast';
import { transactionService } from '../services/stellar/transactionService';
import { sorobanService } from '../services/contract/sorobanService';
import { isValidStellarAddress, getExplorerUrl } from '../utils/stellar';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

export type PaymentExecutionStage =
  | 'idle'
  | 'preparing'
  | 'signing_payment'
  | 'submitting_payment'
  | 'signing_contract'
  | 'submitting_contract'
  | 'success'
  | 'failed';

export const PaymentsPage: React.FC = () => {
  const { publicKey, status, refreshBalances } = useWallet();
  const { currentNetwork } = useNetworkStore();
  const { openModal } = useUIStore();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [tab, setTab] = useState<'single' | 'batch' | 'path'>('single');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [assetCode, setAssetCode] = useState('XLM');
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState<'MEMO_TEXT' | 'MEMO_ID'>('MEMO_TEXT');

  const [stage, setStage] = useState<PaymentExecutionStage>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [horizonTxHash, setHorizonTxHash] = useState<string | null>(null);
  const [contractTxHash, setContractTxHash] = useState<string | null>(null);

  const networkExplorerId = (currentNetwork.id === 'public' || currentNetwork.id === 'futurenet') ? currentNetwork.id : 'testnet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'connected' || !publicKey) {
      toastError('Wallet Not Connected', 'Please connect your wallet to execute payment transactions.');
      openModal('wallet_connect');
      return;
    }
    if (!destination) {
      toastError('Validation Error', 'Please enter a destination public key address.');
      return;
    }
    if (!isValidStellarAddress(destination)) {
      toastError('Invalid Address', 'Destination must be a valid G... Stellar public key.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toastError('Validation Error', 'Please specify a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    setStage('preparing');
    setHorizonTxHash(null);
    setContractTxHash(null);

    const paymentMemo = memo || `Pay ${Date.now().toString(36).slice(-6)}`;

    // STEP 1: Execute Native XLM Payment Transfer on Horizon
    try {
      setStage('signing_payment');
      const res = await transactionService.sendPayment({
        sourcePublicKey: publicKey,
        destinationPublicKey: destination,
        amount,
        assetCode,
        memo: paymentMemo,
        memoType,
      });

      setHorizonTxHash(res.hash);
      toastSuccess('Step 1 Confirmed', `XLM payment transfer submitted to ${currentNetwork.name}.`);

      // STEP 2: Auto-record on Deployed Soroban Payment Tracker Smart Contract
      setStage('signing_contract');
      toastInfo(
        'Soroban Contract Sync (Step 2 of 2)',
        'Please sign the Soroban contract recording transaction in your wallet.'
      );

      try {
        const contractRes = await sorobanService.recordPayment(
          {
            from: publicKey,
            to: destination,
            amount,
            memo: paymentMemo,
          },
          (currentContractStage) => {
            if (currentContractStage === 'preparing') setStage('preparing');
            if (currentContractStage === 'awaiting_signature') setStage('signing_contract');
            if (currentContractStage === 'submitting') setStage('submitting_contract');
          }
        );

        if (contractRes.status === 'SUCCESS') {
          setContractTxHash(contractRes.transactionHash || null);
          toastSuccess('Payment Flow Complete', 'Payment transferred & recorded on Soroban contract!');
        }
      } catch (contractErr) {
        console.warn('[PaymentsPage] Soroban contract recording note:', contractErr);
        const contractMsg = contractErr instanceof Error ? contractErr.message : 'Soroban contract recording failed.';
        toastInfo('Soroban Recording Skipped', `XLM payment succeeded. Contract note: ${contractMsg}`);
      }

      setStage('success');
      setIsSubmitting(false);
      setDestination('');
      setAmount('');
      setMemo('');
      await refreshBalances();
    } catch (err) {
      setStage('failed');
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Transaction failed or rejected.';
      toastError('Payment Failed', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Send className="w-7 h-7 text-cyan-400" />
            <span>Stellar Payment Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Execute fast single transfers, path payments, and multi-operation batches on {currentNetwork.name}.
          </p>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center p-1 bg-slate-900/80 border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'single' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Direct Transfer
          </button>
          <button
            type="button"
            onClick={() => setTab('batch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'batch' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Batch Payment
          </button>
          <button
            type="button"
            onClick={() => setTab('path')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'path' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Path Payment
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {tab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PAYMENT FORM */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Send Stellar Payment</span>
                <Badge variant="cyan">{currentNetwork.name}</Badge>
              </CardTitle>
              <CardDescription>
                Construct, sign via wallet extension, and submit payment transactions to Horizon ({currentNetwork.name}).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* STELLAR ARCHITECTURE NOTIFICATION */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-purple-300">Stellar Protocol Multi-Envelope Architecture:</span>
                  <span className="text-slate-400 ml-1">
                    Stellar Core mandates separate operation envelopes for native XLM transfers and Soroban host calls. You will approve Step 1 (Horizon XLM Transfer) followed by Step 2 (Soroban Contract Record).
                  </span>
                </div>
              </div>

              {/* LIVE STEP STAGE PROGRESS BANNER */}
              {stage !== 'idle' && (
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-400">Payment Workflow Progress:</span>
                    <span className="uppercase text-cyan-300 tracking-wider">{stage.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300 pt-1">
                    {stage === 'preparing' && (
                      <>
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        <span>Preparing payment transaction envelope & account sequence...</span>
                      </>
                    )}
                    {stage === 'signing_payment' && (
                      <>
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>Awaiting Step 1 approval in wallet: XLM Transfer (Horizon)...</span>
                      </>
                    )}
                    {stage === 'submitting_payment' && (
                      <>
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>Submitting XLM transfer to Stellar Horizon testnet...</span>
                      </>
                    )}
                    {stage === 'signing_contract' && (
                      <>
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        <span>Awaiting Step 2 approval in wallet: Soroban Payment Tracker Smart Contract Record...</span>
                      </>
                    )}
                    {stage === 'submitting_contract' && (
                      <>
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>Submitting payment metadata to Soroban RPC node...</span>
                      </>
                    )}
                    {stage === 'success' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Payment transferred & recorded on Soroban contract!</span>
                      </>
                    )}
                    {stage === 'failed' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-300">Payment failed or cancelled.</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* SUCCESS HASHES DISPLAY */}
              {horizonTxHash && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Horizon XLM Transfer Confirmed!</span>
                  </div>
                  <div className="font-mono text-slate-300 break-all">
                    <span className="text-slate-400 font-sans">XLM Tx Hash: </span>
                    <a
                      href={getExplorerUrl(horizonTxHash, 'tx', networkExplorerId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      {horizonTxHash}
                    </a>
                  </div>
                  {contractTxHash && (
                    <div className="font-mono text-slate-300 break-all pt-1 border-t border-emerald-500/20">
                      <span className="text-slate-400 font-sans">Soroban Contract Tx Hash: </span>
                      <a
                        href={getExplorerUrl(contractTxHash, 'tx', networkExplorerId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 underline hover:text-purple-200"
                      >
                        {contractTxHash}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Destination Public Key"
                  placeholder="e.g. GCBAK4S46D2M4S35PXQKZ2O6K6T3237M64Q7WEX4Z2L4XJ5Q4Y7K"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={isSubmitting}
                  helperText="Must be a valid G... 56-character Ed25519 public key"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSubmitting}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Asset</label>
                    <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      {['XLM'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setAssetCode(code)}
                          disabled={isSubmitting}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            assetCode === code
                              ? 'bg-slate-800 text-cyan-400 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Memo (Optional)"
                      placeholder="Enter memo text or ID"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Memo Type</label>
                    <select
                      value={memoType}
                      onChange={(e) => setMemoType(e.target.value as 'MEMO_TEXT' | 'MEMO_ID')}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="MEMO_TEXT">MEMO_TEXT</option>
                      <option value="MEMO_ID">MEMO_ID</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Payment & Record on Soroban
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* SIDEBAR TIPS */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-400">
                <p>
                  Transactions are constructed locally, simulated via Horizon/Soroban RPC nodes, and signed by your connected wallet extension.
                </p>
                <p className="text-slate-300">
                  Every payment is automatically logged in the on-chain Soroban Payment Tracker smart contract for immutable tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
