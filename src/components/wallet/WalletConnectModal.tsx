import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/useUIStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useToast } from '../../hooks/useToast';
import { WalletType } from '../../types/wallet';
import { ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { truncateAddress } from '../../utils/formatters';

export const WalletConnectModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const { connect, disconnect, status, publicKey, walletType } = useWalletStore();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [selectedType, setSelectedType] = useState<WalletType | null>(null);

  const isOpen = activeModal === 'wallet_connect';

  const walletProviders: Array<{
    id: WalletType;
    name: string;
    description: string;
    icon: string;
    isPopular?: boolean;
  }> = [
    {
      id: 'freighter',
      name: 'Freighter Wallet',
      description: 'Official Stellar browser extension wallet by SDF',
      icon: '🚀',
      isPopular: true,
    },
    {
      id: 'albedo',
      name: 'Albedo Web Wallet',
      description: 'Browser-based pop-up key manager & web signer',
      icon: '🌟',
    },
    {
      id: 'xbull',
      name: 'xBull Wallet',
      description: 'Powerful multi-network Stellar wallet for web & mobile',
      icon: '🐂',
    },
    {
      id: 'lobstr',
      name: 'LOBSTR Wallet',
      description: 'Mobile & Web Stellar wallet with instant swap',
      icon: '🦞',
    },
    {
      id: 'secret_key',
      name: 'Developer Test Key',
      description: 'Quick local testnet secret key entry (Dev Mode)',
      icon: '🔑',
    },
  ];

  const handleConnect = async (type: WalletType) => {
    setSelectedType(type);
    try {
      await connect(type);
      const state = useWalletStore.getState();
      if (state.status === 'connected' && state.publicKey) {
        toastSuccess(
          'Wallet Connected',
          `Successfully connected via ${type.toUpperCase()} (${state.publicKey.slice(0, 6)}...${state.publicKey.slice(-4)})`
        );
        closeModal();
      } else {
        toastError('Connection Failed', state.error || 'Unable to connect to wallet.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to wallet provider.';
      toastError('Wallet Connection Failed', errorMsg);
    } finally {
      setSelectedType(null);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toastInfo('Wallet Disconnected', 'Your wallet has been disconnected.');
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={status === 'connected' ? 'Connected Wallet' : 'Connect Stellar Wallet'}
      description={
        status === 'connected'
          ? 'Manage your active wallet session and Stellar Testnet account.'
          : 'Choose your preferred wallet provider to interact with Stellar & Soroban.'
      }
      maxWidth="md"
    >
      {status === 'connected' && publicKey ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Active Provider: {walletType?.toUpperCase()}
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-1">Public Account Key</p>
            <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-white/5 font-mono text-sm text-slate-200">
              <span>{truncateAddress(publicKey, 8)}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicKey);
                  toastInfo('Copied to Clipboard', 'Public key copied to clipboard.');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-sans"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="danger" className="w-full" onClick={handleDisconnect}>
              Disconnect Wallet
            </Button>
            <Button variant="secondary" className="w-full" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {walletProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleConnect(provider.id)}
              disabled={selectedType === provider.id}
              className="w-full text-left p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900/90 border border-white/5 hover:border-cyan-500/40 transition-all duration-200 group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl border border-white/10 group-hover:border-cyan-500/30">
                  {provider.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {provider.name}
                    </h4>
                    {provider.isPopular && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{provider.description}</p>
                </div>
              </div>

              {selectedType === provider.id ? (
                <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              )}
            </button>
          ))}

          <div className="pt-3 text-center border-t border-white/5">
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 transition-colors"
            >
              Don't have a Stellar wallet? Get Freighter <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};
