import { useMutation, useQuery } from '@tanstack/react-query';
import { Droplets, Leaf, Recycle, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const defaultForm = {
  category: 'Tops',
  conditionLabel: 'Gently Used',
  description: '',
  imageUrl: '',
  materialId: '',
  price: '34',
  title: '',
};

export function SellPage() {
  const { isAuthenticated, token } = useAuth();
  const [formState, setFormState] = useState(defaultForm);

  const materialsQuery = useQuery({
    queryFn: () => apiRequest('/materials'),
    queryKey: ['materials'],
  });

  const selectedMaterialId = useMemo(() => (
    formState.materialId || String(materialsQuery.data?.materials?.[0]?.id || '')
  ), [formState.materialId, materialsQuery.data]);

  const previewQuery = useQuery({
    enabled: Boolean(selectedMaterialId && formState.conditionLabel),
    queryFn: () => apiRequest('/products/preview-score', {
      body: JSON.stringify({
        conditionLabel: formState.conditionLabel,
        materialId: Number(selectedMaterialId),
      }),
      method: 'POST',
    }),
    queryKey: ['preview-score', selectedMaterialId, formState.conditionLabel],
  });

  const createListingMutation = useMutation({
    mutationFn: () => apiRequest('/products', {
      body: JSON.stringify({
        ...formState,
        materialId: Number(selectedMaterialId),
        price: Number(formState.price),
      }),
      headers: authHeaders(token),
      method: 'POST',
    }),
    onSuccess: () => {
      setFormState((current) => ({
        ...defaultForm,
        materialId: current.materialId,
      }));
    },
  });

  const preview = previewQuery.data?.preview;

  if (!isAuthenticated) {
    return (
      <section className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-10 text-center shadow-[0_20px_60px_-34px_rgba(55,45,32,0.45)] backdrop-blur">
        <Sparkles className="mx-auto h-8 w-8 text-[#4e7f74]" />
        <h1 className="mt-4 font-heading text-4xl text-stone-900">Sign in before you list an item</h1>
        <p className="mx-auto mt-3 max-w-2xl text-stone-600">The real-time score preview is already wired to the backend. Log in to publish a listing and save the calculated water and CO2 impact.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#2f5d50] px-5 py-3 text-sm font-semibold text-white">Go to login</Link>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <form className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_20px_60px_-34px_rgba(55,45,32,0.45)] backdrop-blur" onSubmit={(event) => { event.preventDefault(); createListingMutation.mutate(); }}>
        <p className="text-xs uppercase tracking-[0.35em] text-[#4e7f74]">Seller studio</p>
        <h1 className="mt-3 font-heading text-4xl text-stone-900">List a garment with live sustainability feedback</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Input label="Item title" value={formState.title} onChange={(value) => setFormState((current) => ({ ...current, title: value }))} placeholder="Used cotton work shirt" />
          <Input label="Price" value={formState.price} onChange={(value) => setFormState((current) => ({ ...current, price: value }))} placeholder="34" />
          <Select label="Category" value={formState.category} onChange={(value) => setFormState((current) => ({ ...current, category: value }))} options={['Tops', 'Outerwear', 'Dresses', 'Denim', 'Accessories']} />
          <Select label="Condition" value={formState.conditionLabel} onChange={(value) => setFormState((current) => ({ ...current, conditionLabel: value }))} options={['Brand New', 'Like New', 'Gently Used', 'Worn']} />
          <label className="block text-sm font-medium text-stone-700 md:col-span-2">
            <span className="mb-2 block">Material</span>
            <select className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={selectedMaterialId} onChange={(event) => setFormState((current) => ({ ...current, materialId: event.target.value }))}>
              {(materialsQuery.data?.materials || []).map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
            </select>
          </label>
          <Input label="Image URL" value={formState.imageUrl} onChange={(value) => setFormState((current) => ({ ...current, imageUrl: value }))} placeholder="Optional image link" />
          <label className="block text-sm font-medium text-stone-700 md:col-span-2">
            <span className="mb-2 block">Description</span>
            <textarea className="min-h-32 w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} placeholder="Share fit, wear notes, and why this piece deserves another cycle." />
          </label>
        </div>

        {createListingMutation.isError ? <p className="mt-4 text-sm text-rose-600">{createListingMutation.error.message}</p> : null}
        {createListingMutation.isSuccess ? <p className="mt-4 text-sm text-emerald-700">Listing created successfully.</p> : null}

        <button type="submit" disabled={createListingMutation.isPending} className="mt-6 rounded-full bg-[#2f5d50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244b41] disabled:opacity-60">
          {createListingMutation.isPending ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>

      <aside className="space-y-6 rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.85)_0%,_rgba(241,234,221,0.95)_100%)] p-8 shadow-[0_20px_60px_-34px_rgba(55,45,32,0.45)] backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#4e7f74]">Live preview</p>
          <h2 className="mt-3 font-heading text-3xl text-stone-900">Your eco-badge updates before submit</h2>
        </div>

        <div className="rounded-[1.75rem] bg-[#2f5d50] p-6 text-white shadow-[0_16px_48px_-30px_rgba(29,51,42,0.8)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Projected badge</p>
              <p className="mt-3 font-heading text-6xl">{preview?.ecoScoreGrade || '--'}</p>
            </div>
            <div className="rounded-full border border-white/20 px-4 py-2 text-sm">{formState.conditionLabel}</div>
          </div>
          <p className="mt-6 text-white/80">{formState.title || 'Your listing title will appear here.'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <Metric icon={<Leaf className="h-5 w-5 text-[#3b6b59]" />} label="Score" value={preview ? String(preview.ecoScoreNumeric) : '--'} />
          <Metric icon={<Droplets className="h-5 w-5 text-[#4e7f74]" />} label="Water saved" value={preview ? `${Math.round(preview.waterSavedLiters)} L` : '--'} />
          <Metric icon={<Recycle className="h-5 w-5 text-[#8c5b43]" />} label="CO2 diverted" value={preview ? `${preview.co2DivertedKg.toFixed(1)} kg` : '--'} />
        </div>

        <p className="text-sm text-stone-600">Formula: <span className="font-medium text-stone-900">(material base value x 0.6) + (condition weight x 0.4)</span>. Worn and gently used items receive the strongest circularity bonus.</p>
      </aside>
    </section>
  );
}

function Input({ label, onChange, placeholder, value }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      <span className="mb-2 block">{label}</span>
      <input className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Select({ label, onChange, options, value }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      <span className="mb-2 block">{label}</span>
      <select className="w-full rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-300/60 bg-white/80 p-4">
      {icon}
      <p className="mt-3 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}
