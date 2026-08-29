import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MobileNavigation } from '../components/common/MobileNavigation';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/ui/Toast';
import { WalletConnectModal } from '../components/wallet/WalletConnectModal';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';

export const DashboardLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 relative">
      {/* Background ambient lighting */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-10 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main
          className={cn(
            'flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 mb-16 md:mb-0',
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          )}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>

          <Footer />
        </main>
      </div>

      <MobileNavigation />
      <WalletConnectModal />
      <ToastContainer />
    </div>
  );
};
