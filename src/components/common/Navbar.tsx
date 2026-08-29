import React from 'react';
import { Menu, Globe, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useWalletStore } from '../../store/useWalletStore';
import { Button } from '../ui/Button';
import { WalletStatusBadge } from '../wallet/WalletStatusBadge';
import logo from '../../assets/logo.svg';

export const Navbar: React.FC = () => {
  const { toggleSidebar, openModal } = useUIStore();
  const { currentNetwork } = useNetworkStore();
  const { status } = useWalletStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Sidebar Toggle + Brand */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <img src={logo} alt="StellarPay Pro Logo" className="w-8 h-8 sm:w-9 sm:h-9" />
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight gradient-text">
                StellarPay Pro
              </span>
            </div>
          </div>
        </div>

        {/* Right: Network indicator + Wallet Status + Connect Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Network Indicator Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-medium">{currentNetwork.name}</span>
          </div>

          {/* Wallet Status Badge (when connected) */}
          {status === 'connected' && <WalletStatusBadge />}

          {/* Connect / Manage Wallet Button */}
          <Button
            variant={status === 'connected' ? 'secondary' : 'glow'}
            size="sm"
            onClick={() => openModal('wallet_connect')}
            leftIcon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
          >
            {status === 'connected' ? 'Wallet Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </header>
  );
};
