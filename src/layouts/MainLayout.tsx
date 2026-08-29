import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/ui/Toast';
import { WalletConnectModal } from '../components/wallet/WalletConnectModal';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global Modals & Toast overlay */}
      <WalletConnectModal />
      <ToastContainer />
    </div>
  );
};
