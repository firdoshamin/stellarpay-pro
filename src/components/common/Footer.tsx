import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950/60 border-t border-white/5 py-8 px-6 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span>StellarPay Pro © 2026</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            Powered by Stellar Network <ShieldCheck className="w-3.5 h-3.5 inline" />
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            Stellar Ecosystem <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://soroban.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            Soroban Docs <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            Testnet Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center space-x-1 text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>on Stellar Testnet</span>
        </div>
      </div>
    </footer>
  );
};
