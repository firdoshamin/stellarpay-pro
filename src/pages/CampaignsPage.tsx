import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Core Payment Engine',
      status: 'Active',
      description:
        'Instant multi-asset payment transactions on Stellar Testnet with memo routing, balance checks, and cryptographic verification.',
      items: [
        'Freighter wallet connection & session persistence',
        'Horizon REST API integration & account balance sync',
        'Direct payment execution & Explorer verification links',
        'Automated Friendbot testnet faucet integration',
      ],
      actionText: 'Open Payment Hub',
      actionPath: '/payments',
      badgeColor: 'cyan' as const,
    },
    {
      title: 'Advanced Financial Workflows',
      status: 'Active',
      description:
        'Multi-operation payment batching, non-custodial time-locked escrows, and asset trustline management.',
      items: [
        'Multi-op transaction envelope batching',
        'Time-locked escrow agreements',
        'Path payments & DEX order routing',
        'Anchor asset trustlines & balance queries',
      ],
      actionText: 'Manage Wallet & Assets',
      actionPath: '/wallet',
      badgeColor: 'purple' as const,
    },
    {
      title: 'Soroban WASM Smart Contracts',
      status: 'Active',
      description:
        'Soroban RPC connection, WASM contract execution, ABI parameter parsing, simulated invocation, and event listeners.',
      items: [
        'Soroban RPC node client integration',
        'Rust WASM smart contract ABI parser & executor',
        'Non-custodial escrow & vault contract interaction',
        'Simulation log output & event listeners',
      ],
      actionText: 'Open Contract Studio',
      actionPath: '/contracts',
      badgeColor: 'cyan' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="pb-4 border-b border-white/5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span>StellarPay Pro Platform Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
          Platform Features & Capabilities
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore the core modules powering StellarPay Pro: Instant Payments, Advanced Workflows, and Soroban WASM Smart Contracts.
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feat, index) => (
          <Card key={index} variant="glass" className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={feat.badgeColor}>{feat.title}</Badge>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{feat.status}</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Key Capabilities
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {feat.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(feat.actionPath)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {feat.actionText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
