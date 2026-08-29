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
import { isValidStellarAddress, getExplorerUrl } from '../utils/stellar';
import { Send, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { publicKey, status, refreshBalances } = useWallet();
  const { currentNetwork } = useNetworkStore();
  const { openModal } = useUIStore();
  const { toastSuccess, toastError } = useToast();

  const [tab, setTab] = useState<'single' | 'batch' | 'path'>('single');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [assetCode, setAssetCode] = useState('XLM');
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState<'MEMO_TEXT' | 'MEMO_ID'>('MEMO_TEXT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const networkExplorerId = (currentNetwork.id === 'public' || currentNetwork.id === 'futurenet') ? currentNetwork.id : 'testnet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'connected' || !publicKey) {
      toastError('Wallet Not Connected', 'Please connect your Freighter wallet to execute payment transactions.');
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
    setTxHash(null);

    try {
      const res = await transactionService.sendPayment({
        sourcePublicKey: publicKey,
        destinationPublicKey: destination,
        amount,
        assetCode,
        memo,
        memoType,
      });

      setIsSubmitting(false);
      setTxHash(res.hash);
      toastSuccess('Payment Submitted Successfully', `Transferred ${amount} ${assetCode} on ${currentNetwork.name}.`);
      setDestination('');
      setAmount('');
      setMemo('');
      await refreshBalances();
    } catch (err) {
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
            onClick={() => setTab('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'single' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Direct Transfer
          </button>
          <button
            onClick={() => setTab('batch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'batch' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Batch Payment
          </button>
          <button
            onClick={() => setTab('path')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                Construct, sign via Freighter, and submit payment transactions to Horizon ({currentNetwork.name}).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {txHash && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Payment Transaction Confirmed!</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono break-all">
                    Tx Hash: {txHash}
                  </p>
                  <a
                    href={getExplorerUrl(txHash, 'tx', networkExplorerId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline font-medium pt-1"
                  >
                    View on StellarExpert Explorer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Destination Public Key"
                  placeholder="e.g. GCBAK4S46D2M4S35PXQKZ2O6K6T3237M64Q7WEX4Z2L4XJ5Q4Y7K"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  helperText="Must be a valid G... 56-character Ed25519 public key"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Payment Amount"
                    type="number"
                    step="0.0000001"
                    placeholder="10.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Select Asset
                    </label>
                    <select
                      value={assetCode}
                      onChange={(e) => setAssetCode(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="XLM">XLM (Native Lumens)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Transaction Memo (Optional)"
                      placeholder="e.g. Invoice #1024 or Payment ID"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Memo Type
                    </label>
                    <select
                      value={memoType}
                      onChange={(e) => setMemoType(e.target.value as 'MEMO_TEXT' | 'MEMO_ID')}
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="MEMO_TEXT">MEMO_TEXT</option>
                      <option value="MEMO_ID">MEMO_ID</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="text-xs text-slate-400">
                    Estimated Fee: <span className="text-cyan-400 font-mono">100 stroops (0.00001 XLM)</span>
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {status === 'connected' ? 'Submit Payment' : 'Connect Wallet to Pay'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* SIDE PREVIEW / TIPS */}
          <div className="space-y-6">
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>Stellar Protocol Guarantees</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <h4 className="font-semibold text-slate-100">Deterministic Atomic Settlement</h4>
                  <p className="text-slate-400">Transactions succeed in full or fail with 0 balance leakage.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <h4 className="font-semibold text-slate-100">Memo Requirement Check</h4>
                  <p className="text-slate-400">Exchange accounts require MEMO_ID or MEMO_TEXT for deposit routing.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'batch' && (
        <Card variant="glass" className="p-8 text-center space-y-4">
          <Badge variant="purple">MULTI-OP ENGINE</Badge>
          <h2 className="text-2xl font-bold text-slate-100">Multi-Operation Batch Payment Engine</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Combine multiple payment operations inside a single Stellar envelope. Ideal for payroll distribution and automated payouts.
          </p>
        </Card>
      )}

      {tab === 'path' && (
        <Card variant="glass" className="p-8 text-center space-y-4">
          <Badge variant="cyan">DECENTRALIZED DEX ROUTING</Badge>
          <h2 className="text-2xl font-bold text-slate-100">Path Payment Strict Send / Receive</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Automatically convert source asset to recipient asset using Stellar DEX order books in one atomic transaction.
          </p>
        </Card>
      )}
    </div>
  );
};
