import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WalletPage } from './pages/WalletPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ActivityPage } from './pages/ActivityPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ContractsPage } from './pages/ContractsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { useEffect } from 'react';
import { useWalletStore } from './store/useWalletStore';

export const App: React.FC = () => {
  useEffect(() => {
    useWalletStore.getState().initWalletSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Route */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Protected Dashboard Application Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
