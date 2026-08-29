import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Send,
  Layers,
  Sparkles,
  Lock,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <section className="relative text-center space-y-8 pt-8 pb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium backdrop-blur-xl animate-float">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Stellar Testnet Payment & Smart Contract Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Next-Gen Payments & <br className="hidden sm:inline" />
          <span className="gradient-text">Soroban Smart Contracts</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          StellarPay Pro provides instant multi-asset transactions, smart escrow agreements, and Soroban WASM contract execution on Stellar Testnet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="glow"
            size="lg"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Launch Dashboard dApp
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/contracts')}
            leftIcon={<Code2 className="w-5 h-5 text-purple-400" />}
          >
            Explore Soroban Contracts
          </Button>
        </div>

        {/* Live Metric Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
          {[
            { label: 'Avg Finality Time', value: '< 4.5s', icon: Zap },
            { label: 'Network Fee', value: '0.00001 XLM', icon: ShieldCheck },
            { label: 'Soroban WASM', value: 'Rust Enabled', icon: Cpu },
            { label: 'Supported Wallets', value: 'Freighter Native', icon: Lock },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-xl text-left"
              >
                <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-100">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE GRID SECTION */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="purple" size="md">PLATFORM CAPABILITIES</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Engineered for High Throughput & Decentralization
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cleanly decoupled architecture utilizing Stellar SDK, Horizon REST APIs, and Soroban RPC nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                <Send className="w-6 h-6" />
              </div>
              <CardTitle>Instant Payments</CardTitle>
              <CardDescription>Fast XLM & Anchor Asset Transfers</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Send and receive XLM, USDC, and custom trustline assets with instant ledger settlement, memo validation, and live Horizon updates.</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                <Layers className="w-6 h-6" />
              </div>
              <CardTitle>Batch & Escrows</CardTitle>
              <CardDescription>Multi-Op Transactions & Escrows</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Execute multi-operation payment batches, create non-custodial time-locked escrows, and track real-time trustline states.</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <Code2 className="w-6 h-6" />
              </div>
              <CardTitle>Soroban WASM</CardTitle>
              <CardDescription>Smart Contract Execution Hub</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Interact with compiled Rust Soroban contracts directly from the browser, inspect ABI functions, and simulate contract state changes.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 backdrop-blur-2xl text-center space-y-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

        <Badge variant="cyan" size="md">READY FOR TESTNET</Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100">
          Experience StellarPay Pro Today
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Connect your Freighter wallet, request free Testnet XLM via Friendbot, and explore the future of Web3 Stellar financial applications.
        </p>
        <div className="pt-2">
          <Button variant="glow" size="lg" onClick={() => navigate('/dashboard')}>
            Open App & Connect Wallet
          </Button>
        </div>
      </section>
    </div>
  );
};
