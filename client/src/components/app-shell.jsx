import { Droplets, Leaf, LogOut, Recycle, Shirt, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../state/auth-context.js';

export function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useAuth();
  const navItems = [
    { icon: Shirt, label: 'Marketplace', to: '/marketplace' },
    { icon: Recycle, label: 'Sell', to: '/sell', roles: ['seller'] },
    { icon: Leaf, label: 'Dashboard', to: '/dashboard' },
    { icon: UserCircle2, label: 'Account', to: isAuthenticated ? '/account' : '/' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(108,138,88,0.18),_transparent_32%),linear-gradient(180deg,_#f6f0e4_0%,_#f2e8d7_50%,_#efe7da_100%)] text-stone-900">
      {isAuthenticated ? (
        <header className="sticky top-0 z-20 border-b border-stone-300/60 bg-[#f8f2e8]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <NavLink to="/marketplace" className="flex items-center gap-3 text-stone-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f5d50] text-white shadow-lg shadow-[#2f5d50]/20">
                <Recycle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-logo text-2xl leading-none tracking-[0.18em]">REWEAR</p>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-600">EcoThread marketplace</p>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.filter((item) => {
                if (!item.roles) {
                  return true;
                }

                return item.roles.includes(user?.role);
              }).map((item) => {
                const NavIcon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-[#2f5d50] text-white' : 'text-stone-700 hover:bg-white/80'}`}
                  >
                    <NavIcon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {user?.role === 'buyer' ? (
                <div className="hidden rounded-full border border-[#8c9f6d]/30 bg-white/70 px-4 py-2 text-sm text-stone-700 sm:flex sm:items-center sm:gap-2">
                  <Droplets className="h-4 w-4 text-[#4e7f74]" />
                  {Math.round(user?.totalWaterSavedLiters || 0)} L saved
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
