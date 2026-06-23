import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cloud, Droplets, Heart, Leaf, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

export function PurchasePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { productId } = useParams();
  const { refreshUser, token, user } = useAuth();
  const canBuy = user?.role === 'buyer';

  const productQuery = useQuery({
    queryFn: () => apiRequest(`/products/${productId}`),
    queryKey: ['product-detail', productId],
  });

  const resolvedProductId = productQuery.data?.product?.id || productId;

  const wishlistQuery = useQuery({
    enabled: canBuy,
    queryFn: () => apiRequest('/wishlist', { headers: authHeaders(token) }),
    queryKey: ['wishlist', token],
  });

  const purchaseMutation = useMutation({
    mutationFn: () => apiRequest('/purchases', {
      body: JSON.stringify({ productId: resolvedProductId }),
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
          body: JSON.stringify({ productId: resolvedProductId }),
          headers: authHeaders(token),
          method: 'POST',
        })
      : apiRequest(`/wishlist/${resolvedProductId}`, {
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
  const isWishlisted = canBuy && (wishlistQuery.data?.wishlist || []).some((item) => item.id === product.id);

  return (
    <div className="py-8">
      <section className="grid gap-16 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-100">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold tracking-widest text-[#556b5d] uppercase shadow-sm backdrop-blur-md">
            <Leaf className="h-4 w-4" /> Eco {product.ecoScoreGrade}
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-12">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">{product.category}</p>
            <h1 className="mt-4 font-heading text-5xl text-stone-900 leading-tight">{product.title}</h1>
            <p className="mt-4 text-2xl font-semibold text-stone-900">${product.price.toFixed(2)}</p>
            <p className="mt-6 text-stone-600 leading-relaxed">{product.description || 'No description provided for this listing yet.'}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 border-y border-stone-200 py-8">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-2">Eco Score</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Leaf className="h-5 w-5 text-[#556b5d]" /> {product.ecoScoreNumeric}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-2">Water Saved</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Droplets className="h-5 w-5 text-[#4e7f74]" /> {Math.round(product.waterSavedLiters)} L
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-2">CO₂ Diverted</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Cloud className="h-5 w-5 text-[#8c5b43]" /> {product.co2DivertedKg.toFixed(1)} kg
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-stone-600">
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <span className="font-semibold text-stone-900">Seller</span>
              <span>{product.seller.name}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <span className="font-semibold text-stone-900">Material</span>
              <span>{product.material.name}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <span className="font-semibold text-stone-900">Condition</span>
              <span>{product.conditionLabel}</span>
            </div>
            <div className="flex justify-between pb-3">
              <span className="font-semibold text-stone-900">Status</span>
              <span className="uppercase tracking-widest text-[10px] font-bold">{product.status}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {!isOwner ? (
              <button type="button" onClick={() => { if (canBuy) purchaseMutation.mutate(); }} disabled={!canBuy || purchaseMutation.isPending || product.status !== 'available'} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#556b5d] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#3f5246] disabled:opacity-50">
                <ShoppingBag className="h-5 w-5" />
                {canBuy ? (purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase') : 'Purchase unavailable for seller account'}
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/sell?listing=${product.id}`)} className="inline-flex w-full items-center justify-center rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-800">
                Edit your listing
              </button>
            )}

            {!isOwner && canBuy ? (
              <button type="button" onClick={() => wishlistMutation.mutate(isWishlisted ? 'DELETE' : 'POST')} disabled={wishlistMutation.isPending} className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50">
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                {isWishlisted ? 'Remove from wishlist' : 'Save for later'}
              </button>
            ) : null}

            {!isOwner && !canBuy ? (
              <p className="text-xs text-stone-500">You can view the full listing details and description here, but seller accounts cannot edit listings they do not own or buy them.</p>
            ) : null}

            {purchaseMutation.isError ? <p className="text-sm text-rose-600">{purchaseMutation.error.message}</p> : null}
            {wishlistMutation.isError ? <p className="text-sm text-rose-600">{wishlistMutation.error.message}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function State({ message, tone = 'default' }) {
  return (
    <div className={`rounded-3xl border px-6 py-24 text-center mt-8 ${tone === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-stone-200 bg-white/50 text-stone-500'}`}>
      <p>{message}</p>
    </div>
  );
}
