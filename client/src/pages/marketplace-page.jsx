import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, Leaf, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ProductDetailSheet } from '../components/product-detail-sheet.jsx';
import { ProductCard } from '../components/product-card.jsx';
import { SectionHeading } from '../components/section-heading.jsx';
import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const defaultFilters = {
  category: '',
  ecoScore: '',
  material: '',
};

export function MarketplacePage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, refreshUser, token, user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const materialsQuery = useQuery({
    queryFn: () => apiRequest('/materials'),
    queryKey: ['materials'],
  });

  const productsQuery = useQuery({
    queryFn: () => {
      const searchParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value);
        }
      });

      return apiRequest(`/products?${searchParams.toString()}`);
    },
    queryKey: ['products', filters],
  });

  const categories = useMemo(() => ['Tops', 'Outerwear', 'Dresses', 'Denim', 'Accessories'], []);

  const selectedProductQuery = useQuery({
    enabled: Boolean(selectedProductId),
    queryFn: () => apiRequest(`/products/${selectedProductId}`),
    queryKey: ['product-detail', selectedProductId],
  });

  const purchaseMutation = useMutation({
    mutationFn: (productId) => apiRequest('/purchases', {
      body: JSON.stringify({ productId }),
      headers: authHeaders(token),
      method: 'POST',
    }),
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product-detail', selectedProductId] });
      setSelectedProductId(null);
    },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(135deg,_rgba(47,93,80,0.96)_0%,_rgba(95,130,103,0.92)_48%,_rgba(193,168,125,0.88)_100%)] px-6 py-8 text-white shadow-[0_24px_70px_-34px_rgba(29,51,42,0.7)] sm:px-10 sm:py-12">
        <SectionHeading
          eyebrow="Circular fashion"
          title="Shop second-hand pieces with visible climate value"
          description="Browse listings scored by material science and circularity. Every card shows real water savings and carbon diversion before you buy."
          action={(
            <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-3 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Live eco-score marketplace
            </div>
          )}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Mission</p>
            <p className="mt-2 text-lg font-medium">Make circular fashion measurable, not vague.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Signals</p>
            <p className="mt-2 text-lg font-medium">Material registry + condition bonus + transparent joins.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Outcome</p>
            <p className="mt-2 text-lg font-medium">A feed where sustainability is visible on every listing.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-300/60 bg-white/70 p-6 shadow-[0_20px_60px_-34px_rgba(55,45,32,0.5)] backdrop-blur sm:p-8">
        <div className="flex items-center gap-3 text-stone-800">
          <Filter className="h-5 w-5 text-[#4e7f74]" />
          <h2 className="font-heading text-2xl">Filter the marketplace</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <select className="rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={filters.ecoScore} onChange={(event) => setFilters((current) => ({ ...current, ecoScore: event.target.value }))}>
            <option value="">All eco grades</option>
            {['A', 'B', 'C', 'D', 'E'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>
          <select className="rounded-2xl border border-stone-300 bg-[#faf6f0] px-4 py-3 outline-none" value={filters.material} onChange={(event) => setFilters((current) => ({ ...current, material: event.target.value }))}>
            <option value="">All materials</option>
            {(materialsQuery.data?.materials || []).map((material) => <option key={material.id} value={material.name}>{material.name}</option>)}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#4e7f74]">Marketplace feed</p>
            <h2 className="mt-2 font-heading text-3xl text-stone-900">Fresh circular listings</h2>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-stone-600">
            {productsQuery.data?.products?.length || 0} items
          </div>
        </div>

        {productsQuery.isLoading ? <FeedState message="Loading marketplace listings..." /> : null}
        {productsQuery.isError ? <FeedState message="The feed could not load. Start the API and try again." tone="error" /> : null}
        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products?.length === 0 ? (
          <FeedState message="No products yet. Sign in and list the first circular piece from the sell page." />
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {(productsQuery.data?.products || []).map((product) => (
            <button key={product.id} type="button" onClick={() => setSelectedProductId(product.id)} className="text-left">
              <ProductCard product={product} />
            </button>
          ))}
        </div>
      </section>

      <ProductDetailSheet
        canBuy={Boolean(isAuthenticated && selectedProductQuery.data?.product?.seller.id !== user?.id && selectedProductQuery.data?.product?.status === 'available')}
        isBuying={purchaseMutation.isPending}
        onBuy={(productId) => purchaseMutation.mutate(productId)}
        onClose={() => setSelectedProductId(null)}
        product={selectedProductQuery.data?.product}
      />
    </div>
  );
}

function FeedState({ message, tone = 'default' }) {
  return (
    <div className={`rounded-[2rem] border px-6 py-10 text-center ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-stone-300/60 bg-white/70 text-stone-600'}`}>
      <Leaf className="mx-auto mb-3 h-6 w-6" />
      <p>{message}</p>
    </div>
  );
}
