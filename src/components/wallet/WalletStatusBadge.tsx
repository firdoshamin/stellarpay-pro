import React from 'react';
import { useWalletStore } from '../../store/useWalletStore';
import { truncateAddress } from '../../utils/formatters';

export const WalletStatusBadge: React.FC = () => {
  const { publicKey, walletType } = useWalletStore();

  if (!publicKey) return null;

  return (
    <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs">
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      <span className="font-mono text-cyan-300">{truncateAddress(publicKey, 4)}</span>
      <span className="text-[10px] text-slate-400 uppercase font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
        {walletType}
      </span>
    </div>
  );
};
