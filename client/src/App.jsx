import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/app-shell.jsx';
import { AccountPage } from './pages/account-page.jsx';
import { DashboardPage } from './pages/dashboard-page.jsx';
import { LoginPage } from './pages/login-page.jsx';
import { MarketplacePage } from './pages/marketplace-page.jsx';
import { PurchasePage } from './pages/purchase-page.jsx';
import { SellPage } from './pages/sell-page.jsx';
import { useAuth } from './state/auth-context.js';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LoginPage />} />
        <Route
          path="/marketplace"
          element={(
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/sell"
          element={(
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/purchase/:productId"
          element={(
            <ProtectedRoute>
              <PurchasePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/account"
          element={(
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
