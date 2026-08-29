import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { sorobanService } from '../services/contract/sorobanService';
import { PaymentRecord, PaymentStatus } from '../types/contract';
import { truncateAddress } from '../utils/formatters';

interface LiveActivityFeedProps {
  contractId?: string;
  autoRefreshIntervalMs?: number;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  contractId = sorobanService.getContractId(),
  autoRefreshIntervalMs = 5000,
}) => {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchLiveEvents = useCallback(async () => {
    try {
      setError(null);
      const count = await sorobanService.getPaymentCount(contractId);
      setTotalCount(count);

      const fetchedRecords: PaymentRecord[] = [];
      const fetchLimit = Math.min(count, 5);

      for (let i = count; i > count - fetchLimit && i > 0; i--) {
        const record = await sorobanService.getPayment(i, contractId);
        if (record) {
          fetchedRecords.push(record);
        }
      }

      setRecords(fetchedRecords);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[LiveActivityFeed] RPC Polling Warning:', err);
      setError('Unable to sync live Soroban contract events. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchLiveEvents();
    const timer = setInterval(fetchLiveEvents, autoRefreshIntervalMs);
    return () => clearInterval(timer);
  }, [fetchLiveEvents, autoRefreshIntervalMs]);

  const getStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.REFUNDED:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Refunded</span>;
      case PaymentStatus.DISPUTED:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Disputed</span>;
      case PaymentStatus.PENDING:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>;
      case PaymentStatus.COMPLETED:
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>;
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Real-time Contract Activity
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live RPC Sync
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Soroban RPC persistent state & event polling • Total On-chain: <strong className="text-cyan-400">{totalCount}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {lastSyncTime}
            </span>
          )}
          <button
            type="button"
            onClick={() => { setLoading(true); fetchLiveEvents(); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner State */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && records.length === 0 && (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-700/60 rounded" />
                <div className="h-3 w-48 bg-slate-700/40 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-700/60 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && records.length === 0 && (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No payment records logged yet</p>
          <p className="text-xs text-slate-500">
            Submit a payment on the Payments page to record your first on-chain Soroban entry.
          </p>
        </div>
      )}

      {/* Live Event Stream List */}
      {records.length > 0 && (
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="group p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">#{rec.id}</span>
                  <span className="font-medium text-sm text-slate-100">{rec.amount} XLM</span>
                  {getStatusBadge(rec.status)}
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>From: <strong className="font-mono text-slate-300">{truncateAddress(rec.sender)}</strong></span>
                  <span>→</span>
                  <span>To: <strong className="font-mono text-slate-300">{truncateAddress(rec.recipient)}</strong></span>
                </div>
                {rec.memo && (
                  <p className="text-[11px] text-slate-400 italic">
                    Memo: &quot;{rec.memo}&quot;
                  </p>
                )}
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/50">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  On-chain Logged
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(rec.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
