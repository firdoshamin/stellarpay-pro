import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useUIStore } from '../store/useUIStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { useToast } from '../hooks/useToast';
import { horizonService } from '../services/stellar/horizonService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatAmount } from '../utils/formatters';
import { getExplorerUrl } from '../utils/stellar';
import {
  Wallet,
  Coins,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  LogOut
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { publicKey, status, balances, refreshBalances, disconnect } = useWallet();
  const { currentNetwork } = useNetworkStore();
  const { openModal } = useUIStore();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [funding, setFunding] = React.useState(false);

  const networkExplorerId = (currentNetwork.id === 'public' || currentNetwork.id === 'futurenet') ? currentNetwork.id : 'testnet';

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toastInfo('Address Copied', 'Stellar public key copied to clipboard.');
    }
  };

  const handleFriendbotFund = async () => {
    if (!publicKey) return;
    setFunding(true);
    const success = await horizonService.friendbotFund(publicKey);
    setFunding(false);
    if (success) {
      toastSuccess('Friendbot Funding Successful', 'Added 10,000 Testnet XLM to your account!');
      await refreshBalances();
    } else {
      toastError('Friendbot Funding Failed', 'Could not request testnet funds from Friendbot.');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toastInfo('Wallet Disconnected', 'Your wallet session has been cleared.');
  };

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-cyan-400" />
            <span>Stellar Wallet Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your keys, trustlines, asset balances, and testnet funds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {status === 'connected' && publicKey && (
            <>
              <Button
                variant="outline"
                size="sm"
                isLoading={funding}
                onClick={handleFriendbotFund}
                leftIcon={<Coins className="w-4 h-4 text-cyan-400" />}
              >
                Fund with Friendbot
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
              >
                Disconnect
              </Button>
            </>
          )}

          {status !== 'connected' && (
            <Button variant="glow" size="sm" onClick={() => openModal('wallet_connect')}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* ACCOUNT KEY DISPLAY CARD */}
      <Card variant="gradient">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="cyan">PRIMARY ACCOUNT</Badge>
              <Badge variant="purple">{currentNetwork.name.toUpperCase()}</Badge>
              {status === 'connected' && (!balances.length || !balances.find((b) => b.code === 'XLM')) && (
                <Badge variant="warning">UNFUNDED ACCOUNT</Badge>
              )}
            </div>

            {status === 'connected' && (!balances.length || !balances.find((b) => b.code === 'XLM')) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="font-semibold text-amber-200">Account not found on {currentNetwork.name}</div>
                <p className="text-[11px] text-amber-300/80">
                  This public key has not been activated on {currentNetwork.name} yet. Use the "Fund with Friendbot" button above to request free 10,000 Testnet XLM.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Public Account Key (Ed25519)
              </span>
              <div className="flex items-center space-x-3 bg-slate-950/80 p-3.5 rounded-xl border border-white/10 font-mono text-sm sm:text-base text-cyan-300 overflow-x-auto">
                <span className="truncate">
                  {publicKey || 'No Wallet Connected'}
                </span>
                {publicKey && (
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    aria-label="Copy key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {publicKey && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy Address
              </Button>
            )}
            {publicKey && (
              <a
                href={getExplorerUrl(publicKey, 'account', networkExplorerId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                >
                  StellarExpert
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* ASSET BALANCES & TRUSTLINES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Asset Balances & Trustlines</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={() => refreshBalances()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* XLM Native Card */}
          <Card variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-sm">
                  XLM
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Stellar Lumens</h3>
                  <p className="text-xs text-slate-400">Native Asset</p>
                </div>
              </div>
              <Badge variant="cyan">Native</Badge>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="text-2xl font-extrabold text-slate-100">
                {formatAmount(balances.find((b) => b.code === 'XLM')?.balance || '0.00')} XLM
              </div>
              <p className="text-xs text-slate-400 mt-1">Available for fees & transactions</p>
            </div>
          </Card>

          {/* USDC Asset Card */}
          <Card variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                  USDC
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">USD Coin</h3>
                  <p className="text-xs text-slate-400">Anchor Token</p>
                </div>
              </div>
              <Badge variant={balances.some((b) => b.code === 'USDC') ? 'purple' : 'outline'}>
                {balances.some((b) => b.code === 'USDC') ? 'Trustline Active' : 'No Trustline'}
              </Badge>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="text-2xl font-extrabold text-slate-100">
                ${formatAmount(balances.find((b) => b.code === 'USDC')?.balance || '0.00')} USDC
              </div>
              <p className="text-xs text-slate-400 mt-1">Issued by Centre Anchor</p>
            </div>
          </Card>

          {/* Add Trustline Card Placeholder */}
          <Card variant="outline" className="flex flex-col items-center justify-center text-center p-6 space-y-3 cursor-pointer hover:border-cyan-500/40">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-800">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Add Custom Trustline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enable new Stellar anchor assets</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
