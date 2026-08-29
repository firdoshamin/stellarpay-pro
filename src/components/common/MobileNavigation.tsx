import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { cn } from '../../utils/cn';

export const MobileNavigation: React.FC = () => {
  // Select top 5 primary routes for mobile bottom bar
  const mobileItems = NAVIGATION_ITEMS.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 py-2 px-3 md:hidden">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs font-medium transition-all',
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
