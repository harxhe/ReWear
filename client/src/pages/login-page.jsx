import { useMutation } from '@tanstack/react-query';
import { LockKeyhole, Mail, Shirt, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { apiRequest } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const initialForm = {
  email: '',
  fullName: '',
  password: '',
  role: 'buyer',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState(initialForm);

  const authMutation = useMutation({
    mutationFn: () => apiRequest(`/auth/${mode === 'login' ? 'login' : 'signup'}`, {
      body: JSON.stringify(mode === 'login'
        ? { email: formState.email, password: formState.password }
        : formState),
      method: 'POST',
    }),
    onSuccess: (data) => {
      setAuth({ token: data.token, user: data.user });
      navigate('/marketplace');
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-6 px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-6 text-center">
          <Shirt className="mx-auto h-8 w-8 text-[#1b3626] mb-4" />
          <h1 className="font-heading text-3xl text-stone-900">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {mode === 'login' ? 'Enter your details to access your archive.' : 'Join the circular fashion movement.'}
          </p>
        </div>

        <div className="flex gap-4 border-b border-stone-100 pb-5">
          <button type="button" className={`text-sm font-semibold transition flex-1 text-center pb-2 border-b-2 ${mode === 'login' ? 'text-stone-900 border-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'}`} onClick={() => setMode('login')}>Log in</button>
          <button type="button" className={`text-sm font-semibold transition flex-1 text-center pb-2 border-b-2 ${mode === 'signup' ? 'text-stone-900 border-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'}`} onClick={() => setMode('signup')}>Sign up</button>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            authMutation.mutate();
          }}
        >
          {mode === 'signup' ? (
            <>
              <Field label="Full name" icon={<UserRound className="h-4 w-4" />}>
                <input className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={formState.fullName} onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))} placeholder="Ava Patel" required />
              </Field>
              <Field label="Account type" icon={<Shirt className="h-4 w-4" />}>
                <div className="relative">
                  <select className="w-full appearance-none rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={formState.role} onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              </Field>
            </>
          ) : null}

          <Field label="Email" icon={<Mail className="h-4 w-4" />}>
            <input className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" type="email" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
          </Field>

          <Field label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
            <input className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} placeholder="Minimum 8 characters" required />
          </Field>

          {authMutation.isError ? <p className="text-sm text-rose-600">{authMutation.error.message}</p> : null}

          <button type="submit" disabled={authMutation.isPending} className="w-full rounded-full bg-[#1b3626] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#122419] disabled:opacity-50">
            {authMutation.isPending ? 'Working...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 rounded-2xl bg-[#f8f6f0] p-5 border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4 text-center">Demo accounts</p>
            <div className="space-y-3">
              <DemoAccountCard
                email="seller@rewear.demo"
                onFill={() => {
                  setMode('login');
                  setFormState({ email: 'seller@rewear.demo', fullName: '', password: 'demo12345', role: 'seller' });
                }}
                title="Seller Demo"
              />
              <DemoAccountCard
                email="buyer@rewear.demo"
                onFill={() => {
                  setMode('login');
                  setFormState({ email: 'buyer@rewear.demo', fullName: '', password: 'demo12345', role: 'buyer' });
                }}
                title="Buyer Demo"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoAccountCard({ email, onFill, title }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div>
        <p className="font-semibold text-stone-900 text-[13px]">{title}</p>
        <p className="text-stone-500 text-[11px]">{email}</p>
      </div>
      <button type="button" onClick={onFill} className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-bold tracking-widest text-stone-600 uppercase transition hover:bg-stone-200">
        Fill
      </button>
    </div>
  );
}

function Field({ children, icon, label }) {
  return (
    <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase">
      <span className="mb-2 flex items-center gap-2 text-stone-500">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
