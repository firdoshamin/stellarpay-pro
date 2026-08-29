import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  History, 
  Trophy, 
  Code2, 
  Settings, 
  Home
} from 'lucide-react';
import { ComponentType } from 'react';

export interface NavItem {
  name: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  isExternal?: boolean;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: Home,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Wallet',
    path: '/wallet',
    icon: Wallet,
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: Send,
  },
  {
    name: 'Activity',
    path: '/activity',
    icon: History,
  },
  {
    name: 'Features',
    path: '/campaigns',
    icon: Trophy,
  },
  {
    name: 'Soroban Contracts',
    path: '/contracts',
    icon: Code2,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];
