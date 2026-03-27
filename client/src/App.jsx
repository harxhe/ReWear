import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/app-shell.jsx';
import { DashboardPage } from './pages/dashboard-page.jsx';
import { LoginPage } from './pages/login-page.jsx';
import { MarketplacePage } from './pages/marketplace-page.jsx';
import { SellPage } from './pages/sell-page.jsx';
import { useAuth } from './state/auth-context.js';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<MarketplacePage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
