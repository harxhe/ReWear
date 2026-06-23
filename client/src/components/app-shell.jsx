import { Droplets, Leaf, LogOut, Recycle, Shirt, UserCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../state/auth-context.js';

export function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add('auth-pages');
    return () => {
      document.documentElement.classList.remove('auth-pages');
    };
  }, []);

  const navItems = [
    { icon: Shirt, label: 'Marketplace', to: '/marketplace' },
    { icon: Recycle, label: 'Sell', to: '/sell', roles: ['seller'] },
    { icon: Leaf, label: 'Dashboard', to: '/dashboard' },
    { icon: UserCircle2, label: 'Account', to: isAuthenticated ? '/account' : '/' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-stone-900 font-sans">
      {isAuthenticated ? (
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f6f0]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <NavLink to="/marketplace" className="flex items-center gap-3 text-stone-900">
              <p className="font-heading text-2xl tracking-wide">ReWear</p>
            </NavLink>

            <nav className="hidden items-center gap-8 md:flex">
              {navItems.filter((item) => {
                if (!item.roles) return true;
                return item.roles.includes(user?.role);
              }).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <NavLink to="/account" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c88f7b] text-sm font-semibold text-white">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <span className="hidden text-sm font-medium text-stone-700 sm:block">
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="text-stone-400 transition hover:text-stone-700"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
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
