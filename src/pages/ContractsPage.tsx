import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../hooks/useWallet';
import {
  sorobanService,
  DEPLOYED_PAYMENT_TRACKER_CONTRACT_ID,
} from '../services/contract/sorobanService';
import {
  PaymentRecord,
  ContractCallStage,
  ContractInvocationResult,
} from '../types/contract';
import { LiveActivityFeed } from '../components/LiveActivityFeed';
import {
  Code2,
  Play,
  Cpu,
  Terminal,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const { isConnected, publicKey, connect } = useWallet();

  const [contractId] = useState(DEPLOYED_PAYMENT_TRACKER_CONTRACT_ID);
  const [selectedFunc, setSelectedFunc] = useState<'record_payment' | 'get_payment' | 'get_payment_count'>('record_payment');

  // record_payment form state
  const [recipient, setRecipient] = useState('GC2B2Z7E2B4W3J2Y5K6L7M8N9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E');
  const [amount, setAmount] = useState('5.0');
  const [memo, setMemo] = useState('Soroban Testnet Tracking #1001');

  // get_payment query state
  const [queryPaymentId, setQueryPaymentId] = useState('1');
  const [retrievedRecord, setRetrievedRecord] = useState<PaymentRecord | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Stats state
  const [paymentCount, setPaymentCount] = useState<number | null>(null);

  // Execution state
  const [stage, setStage] = useState<ContractCallStage>('idle');
  const [execResult, setExecResult] = useState<ContractInvocationResult | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sorobanService.getPaymentCount(contractId).then(setPaymentCount);
  }, [contractId]);

  const handleCopyContractId = () => {
    navigator.clipboard.writeText(contractId);
    setCopied(true);
    toastInfo('Copied to Clipboard', 'Contract ID copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteRecordPayment = async () => {
    if (!isConnected || !publicKey) {
      toastError('Wallet Required', 'Please connect your wallet to invoke Soroban contract functions.');
      connect('freighter');
      return;
    }

    if (!recipient || !recipient.startsWith('G') || recipient.length !== 56) {
      toastError('Validation Error', 'Please enter a valid Stellar G... recipient address.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toastError('Validation Error', 'Amount must be greater than zero.');
      return;
    }

    setExecResult(null);
    setStage('preparing');

    try {
      const res = await sorobanService.recordPayment(
        {
          from: publicKey,
          to: recipient,
          amount,
          memo,
        },
        (currentStage) => setStage(currentStage),
        contractId
      );

      setExecResult(res);
      setStage('success');
      toastSuccess('Contract Transaction Confirmed', `Payment recorded on Soroban contract.`);
      sorobanService.getPaymentCount(contractId).then(setPaymentCount);
    } catch (err) {
      setStage('failed');
      const msg = err instanceof Error ? err.message : 'Soroban contract execution failed.';
      toastError('Contract Execution Failed', msg);
    }
  };

  const handleQueryPayment = async () => {
    const idNum = parseInt(queryPaymentId, 10);
    if (isNaN(idNum) || idNum < 1) {
      toastError('Validation Error', 'Please enter a valid numeric Payment ID (>= 1).');
      return;
    }

    setIsQuerying(true);
    setRetrievedRecord(null);
    setQueryError(null);

    try {
      const rec = await sorobanService.getPayment(idNum, contractId);
      setIsQuerying(false);
      if (rec) {
        setRetrievedRecord(rec);
        toastSuccess('Record Found', `Fetched record #${idNum} from Soroban storage.`);
      } else {
        setQueryError(`No payment record found with ID #${idNum} in contract storage.`);
        toastError('Not Found', `No record found with ID #${idNum} in contract storage.`);
      }
    } catch {
      setIsQuerying(false);
      setQueryError('Failed to fetch payment record from Soroban RPC.');
      toastError('Query Error', 'Failed to fetch payment record from Soroban contract.');
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
              <Code2 className="w-7 h-7 text-purple-400" />
              <span>Soroban WASM Contract Hub</span>
            </h1>
            <Badge variant="purple">Stellar Testnet</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Interact with the deployed Payment Tracker smart contract on Stellar Testnet.
          </p>
        </div>

        <a
          href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-xs font-semibold text-purple-300 transition-all shadow-sm"
        >
          <ExternalLink className="w-4 h-4 text-purple-400" />
          <span>View on Stellar Expert</span>
        </a>
      </div>

      {/* DEPLOYED CONTRACT INFORMATION BANNER */}
      <Card variant="glass" className="border-purple-500/20 bg-purple-950/10">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-bold text-slate-100">Level 3 Payment Tracker Contract</span>
              <Badge variant="success" size="sm">Deployed & Verified</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10 overflow-x-auto">
              <span className="truncate">{contractId}</span>
              <button
                type="button"
                onClick={handleCopyContractId}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0 ml-1 cursor-pointer"
                title="Copy Contract ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-white/5 text-center">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Network</div>
              <div className="text-purple-300">Stellar Testnet</div>
            </div>
            <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-white/5 text-center">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Payments Recorded</div>
              <div className="text-cyan-300 text-sm font-bold">{paymentCount !== null ? paymentCount : '...'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REAL-TIME EVENT STREAMING FEED */}
      <LiveActivityFeed contractId={contractId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONTRACT FUNCTION EXECUTOR */}
        <Card variant="glass" className="lg:col-span-2 space-y-6">
          <CardHeader className="flex-col items-start justify-start gap-1">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Contract Function Executor</span>
            </CardTitle>
            <CardDescription>
              Execute contract calls signed by your connected wallet or query stored state.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* FUNCTION SELECTOR TAB */}
            <div className="flex p-1 bg-slate-950/80 rounded-xl border border-white/10 relative z-20">
              <button
                type="button"
                onClick={() => setSelectedFunc('record_payment')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  selectedFunc === 'record_payment'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                record_payment (Write)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFunc('get_payment')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  selectedFunc === 'get_payment'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                get_payment (Read)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFunc('get_payment_count')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  selectedFunc === 'get_payment_count'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                get_payment_count (Read)
              </button>
            </div>

            {/* RECORD_PAYMENT FORM */}
            {selectedFunc === 'record_payment' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-purple-400 tracking-wider">
                    Soroban record_payment(from: Address, to: Address, amount: i128, memo: String)
                  </h4>
                  <Badge variant="purple" size="sm">Requires Auth</Badge>
                </div>

                <Input
                  label="Sender (from - Connected Wallet)"
                  value={publicKey || ''}
                  placeholder="Connect Freighter wallet to auto-fill"
                  readOnly
                  disabled
                />

                <Input
                  label="Recipient Address (to)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="G..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Amount (XLM)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Input
                    label="Memo / Reference"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>

                {/* TRANSACTION STAGE INDICATOR */}
                {stage !== 'idle' && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Execution Status:</span>
                      <span className="font-bold uppercase tracking-wider text-purple-300">{stage}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      {stage === 'preparing' && (
                        <>
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          <span>Preparing Soroban transaction XDR & simulation...</span>
                        </>
                      )}
                      {stage === 'awaiting_signature' && (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Awaiting transaction signature in wallet extension...</span>
                        </>
                      )}
                      {stage === 'submitting' && (
                        <>
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span>Submitting transaction to Soroban RPC node...</span>
                        </>
                      )}
                      {stage === 'success' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Transaction successfully executed on Soroban Testnet!</span>
                        </>
                      )}
                      {stage === 'failed' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-300">Transaction failed or cancelled.</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="glow"
                  className="w-full"
                  isLoading={stage === 'preparing' || stage === 'awaiting_signature' || stage === 'submitting'}
                  onClick={handleExecuteRecordPayment}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Sign & Invoke record_payment
                </Button>
              </div>
            )}

            {/* GET_PAYMENT QUERY FORM */}
            {selectedFunc === 'get_payment' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">
                    Soroban get_payment(payment_id: u64)
                  </h4>
                  <Badge variant="cyan" size="sm">Read-Only (No Auth)</Badge>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      label="Payment Record ID"
                      type="number"
                      value={queryPaymentId}
                      onChange={(e) => setQueryPaymentId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      isLoading={isQuerying}
                      onClick={handleQueryPayment}
                      leftIcon={<Search className="w-4 h-4 text-cyan-400" />}
                    >
                      Fetch Record
                    </Button>
                  </div>
                </div>

                {retrievedRecord ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-slate-400 font-medium">Payment Record ID:</span>
                      <span className="font-bold text-cyan-300 text-sm">#{retrievedRecord.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Sender (from):</span>
                      <span className="font-mono text-slate-200 truncate max-w-[220px]" title={retrievedRecord.sender}>
                        {retrievedRecord.sender}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Recipient (to):</span>
                      <span className="font-mono text-slate-200 truncate max-w-[220px]" title={retrievedRecord.recipient}>
                        {retrievedRecord.recipient}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Amount:</span>
                      <span className="font-bold text-emerald-400">
                        {retrievedRecord.amount} XLM <span className="text-slate-400 font-normal">({retrievedRecord.rawAmount} stroops)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Memo / Reference:</span>
                      <span className="text-slate-200 font-medium">{retrievedRecord.memo || 'N/A'}</span>
                    </div>
                    {retrievedRecord.timestamp > 0 && (
                      <div className="flex justify-between items-center border-t border-white/10 pt-2 text-slate-400">
                        <span>Ledger Timestamp:</span>
                        <span className="font-mono text-slate-300">
                          {new Date(retrievedRecord.timestamp * 1000).toUTCString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  queryError && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{queryError}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* GET_PAYMENT_COUNT VIEW */}
            {selectedFunc === 'get_payment_count' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-white/5 text-center py-8">
                <div className="flex justify-center mb-1">
                  <Badge variant="cyan" size="sm">Read-Only (No Auth)</Badge>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Total Recorded Payment Count in Smart Contract
                </div>
                <div className="text-4xl font-extrabold text-cyan-400">
                  {paymentCount !== null ? paymentCount : '...'}
                </div>
                <p className="text-xs text-slate-400">
                  Read from Soroban persistent storage instance on Stellar Testnet.
                </p>
                <div className="pt-2 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      sorobanService.getPaymentCount(contractId).then(setPaymentCount);
                      toastInfo('Refreshed', 'Fetched latest payment count from Soroban storage.');
                    }}
                    leftIcon={<RefreshCw className="w-4 h-4 text-cyan-400" />}
                  >
                    Refresh On-Chain Count
                  </Button>
                </div>
              </div>
            )}

            {/* TRANSACTION RESULT BOX */}
            {execResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">
                    Soroban Execution Result
                  </span>
                  <Badge variant="success" size="sm">SUCCESS</Badge>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-slate-400">Tx Hash: </span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${execResult.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300 break-all"
                    >
                      {execResult.transactionHash}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">Contract ID: </span>
                    <span className="text-purple-300">{execResult.contractId}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMART CONTRACT SPEC & ABI CARDS */}
        <div className="space-y-6">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Payment Tracker WASM ABI</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-bold">record_payment</span>
                  <Badge variant="purple" size="sm">Mutative</Badge>
                </div>
                <p className="text-slate-400">Records payment details and emits Soroban contract event.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">get_payment</span>
                  <Badge variant="cyan" size="sm">Read-only</Badge>
                </div>
                <p className="text-slate-400">Queries payment record by unique ID.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">get_payment_count</span>
                  <Badge variant="cyan" size="sm">Read-only</Badge>
                </div>
                <p className="text-slate-400">Returns total number of recorded payment transactions.</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>WASM Binary Spec</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400 font-mono">
              <div><span className="text-slate-500">Language:</span> Rust (soroban-sdk v21.7.7)</div>
              <div><span className="text-slate-500">Target:</span> wasm32v1-none</div>
              <div><span className="text-slate-500">Optimized Size:</span> 3.3 KB</div>
              <div><span className="text-slate-500">WASM Hash:</span> 11a553aac184...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
