import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useUIStore } from '../store/useUIStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { horizonService } from '../services/stellar/horizonService';
import { StellarTransactionRecord } from '../types/stellar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatAmount, truncateAddress } from '../utils/formatters';
import { getExplorerUrl } from '../utils/stellar';
import {
  Wallet,
  Send,
  History,
  Code2,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, status, balances, refreshBalances } = useWallet();
  const { currentNetwork } = useNetworkStore();
  const { openModal } = useUIStore();
  const [recentTxs, setRecentTxs] = useState<StellarTransactionRecord[]>([]);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);

  const xlmBalance = status === 'connected' ? (balances.find((b) => b.code === 'XLM')?.balance || '0.00') : '0.00';
  const usdcBalance = status === 'connected' ? (balances.find((b) => b.code === 'USDC')?.balance || '0.00') : '0.00';

  const networkExplorerId = (currentNetwork.id === 'public' || currentNetwork.id === 'futurenet') ? currentNetwork.id : 'testnet';

  useEffect(() => {
    if (status === 'connected' && publicKey) {
      setIsLoadingTxs(true);
      horizonService
        .fetchAccountTransactions(publicKey, 5)
        .then((txs) => setRecentTxs(txs))
        .catch(() => setRecentTxs([]))
        .finally(() => setIsLoadingTxs(false));
    } else {
      setRecentTxs([]);
    }
  }, [status, publicKey]);

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Dashboard Overview
            </h1>
            <Badge variant="cyan">{currentNetwork.name}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {status === 'connected' && publicKey
              ? `Connected: ${truncateAddress(publicKey, 6)}`
              : 'Connect your Stellar wallet to view live balances and execute transactions.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {status !== 'connected' ? (
            <Button variant="glow" onClick={() => openModal('wallet_connect')}>
              Connect Wallet
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => refreshBalances()}>
                Refresh Balances
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/payments')}
                leftIcon={<Send className="w-4 h-4" />}
              >
                New Payment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* QUICK STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="gradient">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Native XLM Balance
            </span>
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {formatAmount(xlmBalance)} <span className="text-sm text-cyan-400">XLM</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stellar Native Asset</span>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Anchor USDC Balance
            </span>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            ${formatAmount(usdcBalance)} <span className="text-sm text-purple-400">USDC</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Centre USD Anchor Asset</div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Connection Status
            </span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xl font-bold text-slate-100 capitalize">
            {status === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {status === 'connected' ? 'Freighter Wallet Active' : 'Click Connect Wallet'}
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Network Protocol
            </span>
            <Code2 className="w-5 h-5" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {currentNetwork.name} <span className="text-sm text-amber-400">Horizon</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Active Network Node</div>
        </Card>
      </div>

      {/* TWO COLUMN CONTENT: QUICK PAY + RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QUICK PAY WIDGET */}
        <Card variant="glass" className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              <span>Quick Payment</span>
            </CardTitle>
            <CardDescription>Send XLM to any Stellar key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Transfer XLM with instant ledger settlement, signature validation, and Horizon submission.
            </p>
            <Button
              variant="glow"
              className="w-full"
              onClick={() => navigate('/payments')}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Open Payment Hub
            </Button>
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY SUMMARY */}
        <Card variant="glass" className="lg:col-span-2 space-y-4">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <span>Recent Horizon Transactions</span>
              </CardTitle>
              <CardDescription>Live transactions on {currentNetwork.name}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
              View All
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {isLoadingTxs ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading transactions from Horizon...
              </div>
            ) : status !== 'connected' ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Wallet not connected. Connect your wallet to view real transaction activity.
              </div>
            ) : recentTxs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent transactions found on {currentNetwork.name} for this account.
              </div>
            ) : (
              recentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-white/5 hover:border-cyan-500/20 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 font-mono">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                      SUCCESS
                    </span>
                    <a
                      href={getExplorerUrl(tx.hash, 'tx', networkExplorerId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
