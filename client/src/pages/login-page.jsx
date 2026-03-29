import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Leaf, LockKeyhole, Mail, Recycle, Shirt, UserRound } from 'lucide-react';
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
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(135deg,_rgba(47,93,80,0.95)_0%,_rgba(88,118,96,0.92)_55%,_rgba(209,168,108,0.85)_100%)] p-8 text-white shadow-[0_24px_70px_-34px_rgba(29,51,42,0.75)] sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">EcoThread marketplace</p>
          <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-tight sm:text-6xl">Buy and resell clothing with real sustainability proof on every listing.</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">ReWear turns second-hand shopping into a measurable circular experience with material-based eco scores, water savings, carbon diversion, and personal impact tracking.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur">
              <Leaf className="h-4 w-4" />
              Live eco-score grading
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur">
              <Recycle className="h-4 w-4" />
              Second-hand impact tracking
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur">
              <Shirt className="h-4 w-4" />
              Real marketplace listings
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <LandingCard title="Transparent grading" text="Every item earns an A-E eco badge from material lifecycle data and condition bonuses." />
            <LandingCard title="Live seller feedback" text="Listing forms preview the eco score before a seller submits the item." />
            <LandingCard title="Buyer impact" text="Purchases roll up into water saved, CO2 diverted, badges, and profile activity." />
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
            <>
              <Field label="Full name" icon={<UserRound className="h-4 w-4" />}>
                <input className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={formState.fullName} onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))} placeholder="Ava Patel" />
              </Field>
              <Field label="Account type" icon={<Shirt className="h-4 w-4" />}>
                <select className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={formState.role} onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </Field>
            </>
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

        <div className="mt-8 rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#4e7f74]">Demo accounts</p>
          <div className="mt-4 space-y-3 text-sm text-stone-700">
            <DemoAccountCard
              email="seller@rewear.demo"
              helper="Use this account to create listings"
              onFill={() => {
                setMode('login');
                setFormState({ email: 'seller@rewear.demo', fullName: '', password: 'demo12345' });
              }}
              title="Seller"
            />
            <DemoAccountCard
              email="buyer@rewear.demo"
              helper="Use this account to purchase and grow the dashboard totals"
              onFill={() => {
                setMode('login');
                setFormState({ email: 'buyer@rewear.demo', fullName: '', password: 'demo12345' });
              }}
              title="Buyer"
            />
          </div>
        </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-300/60 bg-white/75 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#4e7f74]">How it works</p>
            <h2 className="mt-3 font-heading text-4xl text-stone-900">Join once, then shop, list, and track your impact.</h2>
          </div>
          <button type="button" onClick={() => setMode('signup')} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
            Get started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StepCard number="01" title="Create one account" text="Sign up on this landing page and choose whether the account is for buying or selling." />
          <StepCard number="02" title="Enter the marketplace" text="After login, you land directly in the authenticated marketplace with all available listings." />
          <StepCard number="03" title="Build your profile" text="Buying and listing activity automatically shape your profile, dashboard, and badges." />
        </div>
      </section>
    </div>
  );
}

function LandingCard({ text, title }) {
  return (
    <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
      <p className="text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/75">{text}</p>
    </div>
  );
}

function StepCard({ number, text, title }) {
  return (
    <div className="rounded-[1.5rem] bg-[#faf6f0] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4e7f74]">{number}</p>
      <p className="mt-3 text-xl font-semibold text-stone-900">{title}</p>
      <p className="mt-2 text-sm text-stone-600">{text}</p>
    </div>
  );
}

function DemoAccountCard({ email, helper, onFill, title }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-900">{title}</p>
          <p className="text-stone-600">{email}</p>
        </div>
        <button type="button" onClick={onFill} className="rounded-full bg-stone-900 px-3 py-2 text-xs font-semibold text-white">
          Fill form
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-500">{helper}</p>
    </div>
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
