import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useWallet } from '../hooks/useWallet';
import { useNetworkStore } from '../store/useNetworkStore';
import { horizonService } from '../services/stellar/horizonService';
import { StellarTransactionRecord } from '../types/stellar';
import { History, ExternalLink, Search, ArrowUpRight, Wallet } from 'lucide-react';
import { getExplorerUrl } from '../utils/stellar';
import { LiveActivityFeed } from '../components/LiveActivityFeed';

export const ActivityPage: React.FC = () => {
  const { publicKey, status } = useWallet();
  const { currentNetwork } = useNetworkStore();
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<StellarTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'connected' && publicKey) {
      setIsLoading(true);
      horizonService
        .fetchAccountTransactions(publicKey, 20)
        .then((txs) => setTransactions(txs))
        .catch(() => setTransactions([]))
        .finally(() => setIsLoading(false));
    } else {
      setTransactions([]);
    }
  }, [status, publicKey]);

  const filteredList = transactions.filter((tx) => {
    return (
      tx.hash.toLowerCase().includes(search.toLowerCase()) ||
      tx.source_account.toLowerCase().includes(search.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const networkExplorerId = (currentNetwork.id === 'public' || currentNetwork.id === 'futurenet') ? currentNetwork.id : 'testnet';

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Ledger Activity & History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Horizon transaction log and cryptographic verification on {currentNetwork.name}.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by hash or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* REAL-TIME SOROBAN EVENT STREAMING FEED */}
      <LiveActivityFeed />

      {/* ACTIVITY LIST */}
      <Card variant="glass" className="p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading account transactions from Horizon ({currentNetwork.name})...
            </div>
          ) : status !== 'connected' ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Wallet not connected. Connect your wallet to view real transaction activity.</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No transactions found on {currentNetwork.name} for this account.
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-slate-100 font-mono">
                        {item.hash.slice(0, 16)}...{item.hash.slice(-8)}
                      </h3>
                      <Badge variant={item.successful ? 'cyan' : 'warning'} size="sm">
                        {item.successful ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Source: {item.source_account.slice(0, 12)}...{item.source_account.slice(-6)}
                    </p>

                    {item.memo && (
                      <p className="text-xs text-slate-400">
                        Memo: <span className="text-slate-300 font-mono">{item.memo}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono text-slate-300">Fee: {item.fee_charged} stroops</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <a
                    href={getExplorerUrl(item.hash, 'tx', networkExplorerId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Explorer
                    </Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
