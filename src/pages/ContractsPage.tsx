import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';
import { sorobanService } from '../services/contract/sorobanService';
import { Code2, Play, Cpu, Terminal, Sparkles } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [contractId, setContractId] = useState(
    'CBAK4S46D2M4S35PXQKZ2O6K6T3237M64Q7WEX4Z2L4XJ5Q4Y7KSOROBAN'
  );
  const [selectedFunc, setSelectedFunc] = useState('deposit_escrow');
  const [argDepositor, setArgDepositor] = useState('');
  const [argBeneficiary, setArgBeneficiary] = useState('');
  const [argAmount, setArgAmount] = useState('500');
  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecResult(null);
    try {
      const res = await sorobanService.invokeFunction(contractId, selectedFunc, {
        depositor: argDepositor,
        beneficiary: argBeneficiary,
        amount: argAmount,
      });
      setIsExecuting(false);
      setExecResult(JSON.stringify(res, null, 2));
      toastSuccess('Soroban Simulation Success', `Executed ${selectedFunc} on testnet contract.`);
    } catch {
      setIsExecuting(false);
      toastError('Execution Error', 'Failed to simulate Soroban WASM contract execution.');
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
              <Code2 className="w-7 h-7 text-purple-400" />
              <span>Soroban WASM Contract Studio</span>
            </h1>
            <Badge variant="purple">Soroban RPC Testnet</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Interact with compiled Rust smart contracts on Stellar Soroban Testnet.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toastInfo('Contract Deployment', 'WASM deployment pipeline ready for Phase 3.')}
          leftIcon={<Cpu className="w-4 h-4 text-purple-400" />}
        >
          Deploy Custom WASM
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONTRACT RUNNER FORM */}
        <Card variant="glass" className="lg:col-span-2 space-y-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Soroban Contract Executor</span>
            </CardTitle>
            <CardDescription>
              Select an ABI entry point, pass typed parameters, and simulate execution on Soroban RPC.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <Input
              label="Target Contract ID (C... Address)"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              helperText="Must be a valid 56-character C... Soroban contract ID"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                ABI Function Selection
              </label>
              <select
                value={selectedFunc}
                onChange={(e) => setSelectedFunc(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="deposit_escrow">deposit_escrow(depositor: Address, beneficiary: Address, amount: i128)</option>
                <option value="release_escrow">release_escrow(escrow_id: u64)</option>
                <option value="get_escrow_details">get_escrow_details(escrow_id: u64)</option>
              </select>
            </div>

            {selectedFunc === 'deposit_escrow' && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-4">
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">
                  Typed Function Parameters (XDR Schema)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="depositor (Address)"
                    value={argDepositor}
                    onChange={(e) => setArgDepositor(e.target.value)}
                  />
                  <Input
                    label="beneficiary (Address)"
                    value={argBeneficiary}
                    onChange={(e) => setArgBeneficiary(e.target.value)}
                  />
                </div>
                <Input
                  label="amount (i128 - stroops)"
                  type="number"
                  value={argAmount}
                  onChange={(e) => setArgAmount(e.target.value)}
                />
              </div>
            )}

            <Button
              variant="glow"
              className="w-full"
              isLoading={isExecuting}
              onClick={handleExecute}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Simulate Soroban Contract Execution
            </Button>

            {execResult && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Simulation Log Output (JSON)
                </span>
                <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono text-emerald-300 overflow-x-auto">
                  {execResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CONTRACT ABI SPEC SPECIFICATION */}
        <div className="space-y-6">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Escrow Smart Contract ABI</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">deposit_escrow</span>
                  <Badge variant="cyan" size="sm">Mutative</Badge>
                </div>
                <p className="text-slate-400">Locks specified token amount in contract storage.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-bold">release_escrow</span>
                  <Badge variant="purple" size="sm">Mutative</Badge>
                </div>
                <p className="text-slate-400">Releases locked escrow to beneficiary key.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
