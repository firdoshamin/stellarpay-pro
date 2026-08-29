import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useNetworkStore } from '../store/useNetworkStore';
import { useToast } from '../hooks/useToast';
import { Settings, Globe, Cpu, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentNetwork, setNetwork } = useNetworkStore();
  const { toastSuccess, toastInfo } = useToast();

  const [horizonUrl, setHorizonUrl] = React.useState(currentNetwork.horizonUrl);
  const [sorobanRpc, setSorobanRpc] = React.useState(currentNetwork.sorobanRpcUrl);

  const handleSaveNetwork = (e: React.FormEvent) => {
    e.preventDefault();
    toastSuccess('Settings Saved', 'Updated Horizon and Soroban RPC endpoint configurations.');
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Settings className="w-7 h-7 text-cyan-400" />
          <span>Application Settings & Network Configuration</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Stellar RPC node endpoints, network passphrase, theme presets, and developer flags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NETWORK CONFIG FORM */}
        <Card variant="glass" className="lg:col-span-2 space-y-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Stellar Network Selector</span>
            </CardTitle>
            <CardDescription>Select active network cluster or specify custom standalone node URLs.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setNetwork('testnet');
                  setHorizonUrl('https://horizon-testnet.stellar.org');
                  setSorobanRpc('https://soroban-testnet.stellar.org');
                  toastInfo('Network Switched', 'Active network changed to Stellar Testnet.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentNetwork.id === 'testnet'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-slate-100 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-100">Stellar Testnet</h4>
                  <Badge variant="cyan" size="sm">DEFAULT</Badge>
                </div>
                <p className="text-xs text-slate-400">Official SDF test network for development</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNetwork('futurenet');
                  setHorizonUrl('https://horizon-futurenet.stellar.org');
                  setSorobanRpc('https://rpc-futurenet.stellar.org');
                  toastInfo('Network Switched', 'Active network changed to Stellar Futurenet.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentNetwork.id === 'futurenet'
                    ? 'bg-purple-500/10 border-purple-500/50 text-slate-100 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-100">Stellar Futurenet</h4>
                  <Badge variant="purple" size="sm">PREVIEW</Badge>
                </div>
                <p className="text-xs text-slate-400">Bleeding-edge Soroban feature releases</p>
              </button>
            </div>

            <form onSubmit={handleSaveNetwork} className="space-y-4 pt-4 border-t border-white/5">
              <Input
                label="Horizon REST API URL"
                value={horizonUrl}
                onChange={(e) => setHorizonUrl(e.target.value)}
              />

              <Input
                label="Soroban RPC Endpoint URL"
                value={sorobanRpc}
                onChange={(e) => setSorobanRpc(e.target.value)}
              />

              <Input
                label="Network Passphrase"
                value={currentNetwork.passphrase}
                readOnly
                className="bg-slate-950/40 text-slate-400 cursor-not-allowed"
              />

              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Network Customizations
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* DEVELOPER TOOLS CARD */}
        <div className="space-y-6">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Developer Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <h4 className="font-semibold text-slate-100">Verbose Horizon Logs</h4>
                  <p className="text-[11px] text-slate-400">Output XDR payloads to browser console</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <h4 className="font-semibold text-slate-100">Soroban Event Streaming</h4>
                  <p className="text-[11px] text-slate-400">Subscribe to contract topics</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
