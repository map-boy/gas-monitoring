/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { Loader2 } from 'lucide-react';
import { LanguageProvider } from './hooks/useLanguage';
import { ThemeProvider } from './components/theme-provider';

import Dashboard from './components/dashboard/Dashboard';
import { StockTable as Stock } from './components/stock/StockTable';
import { SalesSystem as Sales } from './components/sales/SalesSystem';
import { CustomersTable as Customers } from './components/customers/CustomersTable';
import { OrdersManagement as Orders } from './components/orders/OrdersManagement';
import { MovementTracking as Movements } from './components/movements/MovementTracking';
import { RentalSystem as Rentals } from './components/rentals/RentalSystem';
import { AdminPortal as Admin } from './components/admin/AdminPortal';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="gasflow-ui-theme">
      <LanguageProvider>
        <ErrorBoundary>
          {!user ? (
            <>
              <Login />
              <Toaster />
            </>
          ) : (
            <Router>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/stock" element={<Stock />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/movements" element={<Movements />} />
                  <Route path="/rentals" element={<Rentals />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
              <Toaster />
            </Router>
          )}
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}
