import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProductCard } from '../components/product-card.jsx';
import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const defaultFilters = {
  category: '',
  ecoScore: '',
  material: '',
};

export function MarketplacePage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);

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

  const categories = useMemo(() => ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Knitwear', 'Accessories', 'Footwear', 'Denim'], []);
  const ecoGrades = useMemo(() => ['A', 'B', 'C', 'D', 'E'], []);

  const wishlistQuery = useQuery({
    enabled: user?.role === 'buyer',
    queryFn: () => apiRequest('/wishlist', { headers: authHeaders(token) }),
    queryKey: ['wishlist', token],
  });

  const wishlistIds = new Set((wishlistQuery.data?.wishlist || []).map((item) => item.id));

  return (
    <div className="space-y-16 py-8">
      <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#556b5d] uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Today's Archive
          </p>
          <h1 className="mt-6 font-heading text-6xl leading-tight text-stone-900 md:text-7xl">
            A wardrobe that has <em className="italic text-[#556b5d]">already lived</em> — and is ready for its next chapter.
          </h1>
        </div>
        <div className="rounded-3xl bg-[#f0eae1] p-8 md:w-80">
          <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">Reading the signal</p>
          <div className="mt-4 flex gap-1">
            <div className="h-8 w-full rounded-l-md bg-[#556b5d] text-center text-xs font-bold leading-8 text-white">A</div>
            <div className="h-8 w-full bg-[#6b826b] text-center text-xs font-bold leading-8 text-white">B</div>
            <div className="h-8 w-full bg-[#c1a68d] text-center text-xs font-bold leading-8 text-white">C</div>
            <div className="h-8 w-full bg-[#c88f7b] text-center text-xs font-bold leading-8 text-white">D</div>
            <div className="h-8 w-full rounded-r-md bg-[#b0705b] text-center text-xs font-bold leading-8 text-white">E</div>
          </div>
          <p className="mt-4 text-xs text-stone-600 leading-relaxed">
            A is best-in-class (low water, low CO₂). E means usable, but resource-heavy. We never hide the score.
          </p>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-10 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:self-start">
          <div>
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 uppercase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
              Filters
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilters(c => ({ ...c, category: '' }))} className={`rounded-full border border-stone-200 px-4 py-1.5 text-xs transition ${!filters.category ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>All</button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilters(c => ({ ...c, category: cat }))} className={`rounded-full border border-stone-200 px-4 py-1.5 text-xs transition ${filters.category === cat ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Eco Grade</h3>
            <div className="flex gap-1">
              {ecoGrades.map((grade) => (
                <button 
                  key={grade} 
                  onClick={() => setFilters(c => ({ ...c, ecoScore: filters.ecoScore === grade ? '' : grade }))}
                  className={`h-10 flex-1 text-xs font-bold transition ${filters.ecoScore === grade ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-[#f8f6f0]' : 'opacity-90 hover:opacity-100'} ${grade === 'A' ? 'bg-[#556b5d] text-white rounded-l-md' : grade === 'B' ? 'bg-[#6b826b] text-white' : grade === 'C' ? 'bg-[#c1a68d] text-white' : grade === 'D' ? 'bg-[#c88f7b] text-white' : 'bg-[#b0705b] text-white rounded-r-md'}`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Material</h3>
            <div className="relative">
              <select className="w-full appearance-none rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm text-stone-600 outline-none transition focus:border-stone-400" value={filters.material} onChange={(event) => setFilters((current) => ({ ...current, material: event.target.value }))}>
                <option value="">All materials</option>
                {(materialsQuery.data?.materials || []).map((material) => <option key={material.id} value={material.name}>{material.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-6 flex items-end justify-between border-b border-stone-200 pb-4">
            <p className="font-heading text-3xl text-stone-800">
              {productsQuery.data?.products?.length || 0} <span className="font-sans text-sm font-normal text-stone-500">pieces available</span>
            </p>
            <div className="relative">
               <select className="appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-10 py-1.5 text-xs text-stone-600 outline-none">
                 <option>Best eco-score</option>
                 <option>Newest</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {productsQuery.isLoading ? <FeedState message="Curating the archive..." /> : null}
          {productsQuery.isError ? <FeedState message="The archive could not load. Start the API and try again." tone="error" /> : null}
          {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products?.length === 0 ? (
            <FeedState message="No pieces found matching your criteria." />
          ) : null}

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {(productsQuery.data?.products || []).map((product) => (
              <div key={product.id} onClick={() => navigate(product.seller.id === user?.id ? `/sell?listing=${product.id}` : `/purchase/${product.id}`)}>
                <ProductCard product={{ ...product, isWishlisted: wishlistIds.has(product.id) }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FeedState({ message, tone = 'default' }) {
  return (
    <div className={`rounded-2xl border px-6 py-16 text-center ${tone === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-stone-200 bg-white/50 text-stone-500'}`}>
      <p>{message}</p>
    </div>
  );
}
