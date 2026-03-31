import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Droplets, Heart, Leaf, Recycle, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

export function PurchasePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { productId } = useParams();
  const { refreshUser, token, user } = useAuth();

  const productQuery = useQuery({
    queryFn: () => apiRequest(`/products/${productId}`),
    queryKey: ['product-detail', productId],
  });

  const wishlistQuery = useQuery({
    queryFn: () => apiRequest('/wishlist', { headers: authHeaders(token) }),
    queryKey: ['wishlist', token],
  });

  const purchaseMutation = useMutation({
    mutationFn: () => apiRequest('/purchases', {
      body: JSON.stringify({ productId: Number(productQuery.data?.product?.id ?? productId) }),
      headers: authHeaders(token),
      method: 'POST',
    }),
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', token] });
      await queryClient.invalidateQueries({ queryKey: ['profile', token] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
      navigate('/dashboard');
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: (method) => method === 'POST'
      ? apiRequest('/wishlist', {
          body: JSON.stringify({ productId: Number(productQuery.data?.product?.id ?? productId) }),
          headers: authHeaders(token),
          method: 'POST',
        })
      : apiRequest(`/wishlist/${Number(productQuery.data?.product?.id ?? productId)}`, {
          headers: authHeaders(token),
          method: 'DELETE',
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
    },
  });

  if (productQuery.isLoading) {
    return <State message="Loading product details..." />;
  }

  if (productQuery.isError) {
    return <State message="This product could not be loaded." tone="error" />;
  }

  const product = productQuery.data.product;
  const isOwner = product.seller.id === user?.id;
  const isWishlisted = (wishlistQuery.data?.wishlist || []).some((item) => item.id === product.id);

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-stone-300/60 bg-white/70 shadow-[0_20px_60px_-34px_rgba(55,45,32,0.5)] backdrop-blur">
          <div className="relative h-[26rem] bg-stone-200">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/0 to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-full bg-[#2f5d50] px-4 py-2 text-sm font-semibold text-white">Eco {product.ecoScoreGrade}</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-[#4e7f74]">Purchase confirmation</p>
          <h1 className="mt-3 font-heading text-5xl text-stone-900">{product.title}</h1>
          <p className="mt-4 text-stone-600">{product.description || 'No description provided for this listing yet.'}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric icon={<Leaf className="h-5 w-5 text-[#3b6b59]" />} label="Eco score" value={String(product.ecoScoreNumeric)} />
            <Metric icon={<Droplets className="h-5 w-5 text-[#4e7f74]" />} label="Water saved" value={`${Math.round(product.waterSavedLiters)} L`} />
            <Metric icon={<Recycle className="h-5 w-5 text-[#8c5b43]" />} label="CO2 diverted" value={`${product.co2DivertedKg.toFixed(1)} kg`} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-[#4e7f74]">Listing details</p>
          <div className="mt-5 space-y-3 text-stone-700">
            <Row label="Price" value={`$${product.price.toFixed(2)}`} />
            <Row label="Seller" value={product.seller.name} />
            <Row label="Category" value={product.category} />
            <Row label="Material" value={product.material.name} />
            <Row label="Condition" value={product.conditionLabel} />
            <Row label="Status" value={product.status} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-[#4e7f74]">Actions</p>
          <div className="mt-5 space-y-3">
            {!isOwner ? (
              <button type="button" onClick={() => purchaseMutation.mutate()} disabled={purchaseMutation.isPending || product.status !== 'available'} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2f5d50] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                <ShoppingBag className="h-4 w-4" />
                {purchaseMutation.isPending ? 'Purchasing...' : 'Confirm purchase'}
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/sell?listing=${product.id}`)} className="inline-flex w-full items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
                Edit your listing
              </button>
            )}

            {!isOwner ? (
              <button type="button" onClick={() => wishlistMutation.mutate(isWishlisted ? 'DELETE' : 'POST')} disabled={wishlistMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 disabled:opacity-60">
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} />
                {isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              </button>
            ) : null}

            {purchaseMutation.isError ? <p className="text-sm text-rose-600">{purchaseMutation.error.message}</p> : null}
            {wishlistMutation.isError ? <p className="text-sm text-rose-600">{wishlistMutation.error.message}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf6f0] px-4 py-3">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4">
      {icon}
      <p className="mt-3 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

function State({ message, tone = 'default' }) {
  return (
    <section className={`rounded-[2rem] border px-6 py-10 text-center ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-stone-300/60 bg-white/80 text-stone-600'}`}>
      <p>{message}</p>
    </section>
  );
}
