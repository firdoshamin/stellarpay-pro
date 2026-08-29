import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils/cn';
import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed top-16 bottom-0 left-0 z-30 bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 flex flex-col justify-between hidden md:flex',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Upper Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}

              {/* Badge if available */}
              {sidebarOpen && item.badge && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Toggle Area */}
      <div className="p-3 border-t border-white/5 space-y-3">
        {sidebarOpen && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Stellar Testnet</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Fast, secure payments & Soroban WASM contract execution.
            </p>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          aria-label="Toggle sidebar expand"
        >
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <PanelLeftClose className="w-5 h-5" />
              <span className="text-xs">Collapse Navigation</span>
            </div>
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
};
