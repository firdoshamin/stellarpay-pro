import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { ToastType } from '../../types/ui';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borderMap: Record<ToastType, string> = {
    success: 'border-emerald-500/40 shadow-emerald-500/10',
    error: 'border-rose-500/40 shadow-rose-500/10',
    warning: 'border-amber-500/40 shadow-amber-500/10',
    info: 'border-cyan-500/40 shadow-cyan-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start space-x-3 p-4 bg-slate-900/90 backdrop-blur-xl border rounded-2xl shadow-xl ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}

            <div className="flex-1 pr-2">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.message}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
