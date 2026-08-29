import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card variant="glass" className="max-w-md w-full text-center p-8 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto glow-purple">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            ERROR 404
          </span>
          <h1 className="text-3xl font-extrabold text-slate-100">Page Not Found</h1>
          <p className="text-sm text-slate-400">
            The requested ledger route or resource does not exist on StellarPay Pro.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>

          <Button
            variant="glow"
            className="w-full"
            onClick={() => navigate('/dashboard')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
