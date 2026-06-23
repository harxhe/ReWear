import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cloud, Droplets, Leaf, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing');
  const { isAuthenticated, token } = useAuth();
  const [draftState, setDraftState] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const materialsQuery = useQuery({
    queryFn: () => apiRequest('/materials'),
    queryKey: ['materials'],
  });

  const listingQuery = useQuery({
    enabled: Boolean(listingId),
    queryFn: () => apiRequest(`/products/${listingId}`),
    queryKey: ['edit-listing', listingId],
  });

  const baseFormState = useMemo(() => {
    if (listingQuery.data?.product) {
      const product = listingQuery.data.product;
      return {
        category: product.category,
        conditionLabel: product.conditionLabel,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        materialId: String(product.material.id),
        price: String(product.price),
        title: product.title,
      };
    }

    return defaultForm;
  }, [listingQuery.data]);

  const formState = draftState || baseFormState;
  const selectedMaterialId = useMemo(() => (
    formState.materialId || String(materialsQuery.data?.materials?.[0]?.id || '')
  ), [formState.materialId, materialsQuery.data]);

  const previewQuery = useQuery({
    enabled: Boolean(selectedMaterialId && formState.conditionLabel),
    queryFn: () => apiRequest('/products/preview-score', {
      body: JSON.stringify({
        conditionLabel: formState.conditionLabel,
        materialId: selectedMaterialId,
      }),
      method: 'POST',
    }),
    queryKey: ['preview-score', selectedMaterialId, formState.conditionLabel],
  });

  const saveListingMutation = useMutation({
    mutationFn: () => apiRequest(listingId ? `/products/${listingId}` : '/products', {
      body: JSON.stringify({
        ...formState,
        materialId: selectedMaterialId,
        price: Number(formState.price),
      }),
      headers: authHeaders(token),
      method: listingId ? 'PUT' : 'POST',
    }),
    onSuccess: () => {
      setSuccessMessage(listingId ? 'Listing updated successfully.' : 'Listing published successfully and is now live in the marketplace.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['profile', token] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', token] });

      if (listingId) {
        navigate('/account');
        return;
      }

      setDraftState((current) => ({ ...defaultForm, materialId: current?.materialId || '' }));
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: () => apiRequest(`/products/${listingId}`, {
      headers: authHeaders(token),
      method: 'DELETE',
    }),
    onSuccess: () => {
      setSuccessMessage('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['profile', token] });
      navigate('/account');
    },
  });

  const preview = previewQuery.data?.preview;

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-16 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[#556b5d]" />
        <h1 className="mt-6 font-heading text-4xl text-stone-900">Sign in before you list an item</h1>
        <p className="mx-auto mt-4 max-w-lg text-stone-600 leading-relaxed">The real-time score preview is already wired to the backend. Log in to publish a listing and save the calculated water and CO₂ impact.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-[#556b5d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3f5246]">Go to landing page</Link>
      </section>
    );
  }

  return (
    <div className="pt-0 pb-0">
      <section className="grid gap-12 lg:grid-cols-[1fr_500px]">
        <form className="space-y-8" onSubmit={(event) => { event.preventDefault(); saveListingMutation.mutate(); }}>
          
          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
            <Input label="Item title" value={formState.title} onChange={(value) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), title: value })); }} placeholder="Used cotton work shirt" />
            <Input label="Price ($)" value={formState.price} onChange={(value) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), price: value })); }} placeholder="34" />
            <Select label="Category" value={formState.category} onChange={(value) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), category: value })); }} options={['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Knitwear', 'Accessories', 'Footwear', 'Denim']} />
            <Select label="Condition" value={formState.conditionLabel} onChange={(value) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), conditionLabel: value })); }} options={['Brand New', 'Like New', 'Gently Used', 'Worn']} />
            
            <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase md:col-span-2">
              <span className="mb-3 block text-stone-500">Material</span>
              <div className="relative">
                <select className="w-full appearance-none rounded-full border border-stone-200 bg-white px-6 py-4 text-base text-stone-900 font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={selectedMaterialId} onChange={(event) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), materialId: event.target.value })); }}>
                  {(materialsQuery.data?.materials || []).map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                </select>
              </div>
            </label>
            
            <div className="flex gap-4 md:col-span-2">
              <div className="flex-1">
                <Input label="Image URL" value={formState.imageUrl} onChange={(value) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), imageUrl: value })); }} placeholder="Optional image link" />
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center justify-center rounded-full border border-transparent bg-stone-200 px-8 py-4 text-base font-sans normal-case font-semibold text-stone-800 transition hover:bg-stone-300">
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSuccessMessage('');
                          setDraftState((current) => ({ ...(current || formState), imageUrl: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            
            <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase md:col-span-2">
              <span className="mb-3 block text-stone-500">Description</span>
              <textarea className="min-h-40 w-full rounded-2xl border border-stone-200 bg-white px-6 py-4 text-base text-stone-900 font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={formState.description} onChange={(event) => { setSuccessMessage(''); setDraftState((current) => ({ ...(current || formState), description: event.target.value })); }} placeholder="Share fit, wear notes, and why this piece deserves another cycle." />
            </label>
          </div>

          {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}
          {saveListingMutation.isError ? <p className="text-sm text-rose-600">{saveListingMutation.error.message}</p> : null}
          {deleteListingMutation.isError ? <p className="text-sm text-rose-600">{deleteListingMutation.error.message}</p> : null}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-200">
            <button type="submit" disabled={saveListingMutation.isPending} className="rounded-full bg-[#556b5d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3f5246] disabled:opacity-50">
              {saveListingMutation.isPending ? (listingId ? 'Saving...' : 'Publishing...') : (listingId ? 'Save changes' : 'Publish listing')}
            </button>
            {listingId ? (
              <button type="button" onClick={() => deleteListingMutation.mutate()} disabled={deleteListingMutation.isPending} className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition disabled:opacity-50">
                {deleteListingMutation.isPending ? 'Deleting...' : 'Delete listing'}
              </button>
            ) : null}
          </div>
        </form>

        <aside className="space-y-6 rounded-3xl bg-[#f0eae1] p-8 flex flex-col">
          <div>
            <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">Live preview</p>
            <h2 className="mt-2 font-heading text-3xl text-stone-900">Your eco-badge updates before submit.</h2>
          </div>

          <div className="rounded-2xl bg-[#556b5d] p-8 text-white flex-grow flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-6 mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-white/60 uppercase">Projected badge</p>
                <p className="mt-2 font-heading text-8xl leading-none">{preview?.ecoScoreGrade || '--'}</p>
              </div>
              <div className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">{formState.conditionLabel}</div>
            </div>
            <p className="font-heading text-2xl leading-snug">{formState.title || 'Your listing title will appear here.'}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Metric icon={<Leaf className="h-5 w-5 text-[#556b5d]" />} label="Score" value={preview ? String(preview.ecoScoreNumeric) : '--'} />
            <Metric icon={<Droplets className="h-5 w-5 text-[#4e7f74]" />} label="Water saved" value={preview ? `${Math.round(preview.waterSavedLiters).toLocaleString()} L` : '--'} />
            <Metric icon={<Cloud className="h-5 w-5 text-[#8c5b43]" />} label="CO₂" value={preview ? `${preview.co2DivertedKg.toFixed(1)} kg` : '--'} />
          </div>

          <p className="text-xs text-stone-500 leading-relaxed border-t border-stone-300 pt-6 mt-2">
            Formula: <span className="font-semibold text-stone-700">(material base value x 0.6) + (condition weight x 0.4)</span>. Worn and gently used items receive the strongest circularity bonus.
          </p>
        </aside>
      </section>
    </div>
  );
}

function Input({ label, onChange, placeholder, value }) {
  return (
    <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase">
      <span className="mb-3 block text-stone-500">{label}</span>
      <input className="w-full rounded-full border border-stone-200 bg-white px-6 py-4 text-base text-stone-900 font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Select({ label, onChange, options, value }) {
  return (
    <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase">
      <span className="mb-3 block text-stone-500">{label}</span>
      <div className="relative">
        <select className="w-full appearance-none rounded-full border border-stone-200 bg-white px-6 py-4 text-base text-stone-900 font-sans normal-case tracking-normal outline-none transition focus:border-stone-400" value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    </label>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-sm text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f6f0] mb-3">
        {icon}
      </div>
      <p className="font-noto text-lg font-bold text-stone-900">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-stone-600 uppercase tracking-widest leading-tight">{label}</p>
    </div>
  );
}
