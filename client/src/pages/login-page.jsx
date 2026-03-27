import { useMutation } from '@tanstack/react-query';
import { Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const initialForm = {
  email: '',
  fullName: '',
  password: '',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
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
      navigate('/dashboard');
    },
  });

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(135deg,_rgba(47,93,80,0.95)_0%,_rgba(88,118,96,0.92)_55%,_rgba(209,168,108,0.85)_100%)] p-8 text-white shadow-[0_24px_70px_-34px_rgba(29,51,42,0.75)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Member access</p>
        <h1 className="mt-4 font-heading text-5xl leading-tight">Track your closet's real climate impact.</h1>
        <p className="mt-4 max-w-xl text-lg text-white/85">Sign in to list garments, calculate eco-scores in real time, and watch your water and carbon savings grow after each purchase.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <Leaf className="h-5 w-5" />
            <p className="mt-3 text-xl font-semibold">Transparent grading</p>
            <p className="mt-2 text-sm text-white/75">Every listing shows an A-E badge based on material lifecycle data and circular condition bonuses.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <LockKeyhole className="h-5 w-5" />
            <p className="mt-3 text-xl font-semibold">JWT session flow</p>
            <p className="mt-2 text-sm text-white/75">Your buyer-seller account stays ready for dashboard, feed, and listing actions.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur sm:p-10">
        <div className="inline-flex rounded-full bg-[#f0eadc] p-1 text-sm font-medium text-stone-700">
          <button type="button" className={`rounded-full px-4 py-2 ${mode === 'login' ? 'bg-stone-900 text-white' : ''}`} onClick={() => setMode('login')}>Log in</button>
          <button type="button" className={`rounded-full px-4 py-2 ${mode === 'signup' ? 'bg-stone-900 text-white' : ''}`} onClick={() => setMode('signup')}>Sign up</button>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            authMutation.mutate();
          }}
        >
          {mode === 'signup' ? (
            <Field label="Full name" icon={<UserRound className="h-4 w-4" />}>
              <input className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={formState.fullName} onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))} placeholder="Ava Patel" />
            </Field>
          ) : null}

          <Field label="Email" icon={<Mail className="h-4 w-4" />}>
            <input className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" type="email" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
          </Field>

          <Field label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
            <input className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} placeholder="Minimum 8 characters" />
          </Field>

          {authMutation.isError ? <p className="text-sm text-rose-600">{authMutation.error.message}</p> : null}

          <button type="submit" disabled={authMutation.isPending} className="w-full rounded-full bg-[#2f5d50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244b41] disabled:opacity-60">
            {authMutation.isPending ? 'Working...' : mode === 'login' ? 'Enter the marketplace' : 'Create my account'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ children, icon, label }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-stone-700">
      <span className="flex items-center gap-2">
        <span className="text-[#4e7f74]">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
