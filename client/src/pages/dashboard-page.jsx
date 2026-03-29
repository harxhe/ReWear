import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Droplets, Leaf, Recycle, ShoppingBag } from 'lucide-react';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { refreshUser, token, user } = useAuth();

  const dashboardQuery = useQuery({
    queryFn: () => apiRequest('/users/me/dashboard', {
      headers: authHeaders(token),
    }),
    queryKey: ['dashboard', token],
  });

  const productsQuery = useQuery({
    queryFn: () => apiRequest('/products?status=available'),
    queryKey: ['available-products'],
  });

  const purchaseMutation = useMutation({
    mutationFn: (productId) => apiRequest('/purchases', {
      body: JSON.stringify({ productId }),
      headers: authHeaders(token),
      method: 'POST',
    }),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['dashboard', token] });
      queryClient.invalidateQueries({ queryKey: ['available-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  if (dashboardQuery.isLoading) {
    return <DashboardState message="Loading your impact dashboard..." />;
  }

  if (dashboardQuery.isError) {
    return <DashboardState message="Your dashboard could not load. Make sure the API is running and you are logged in." tone="error" />;
  }

  const dashboard = dashboardQuery.data.dashboard;
  const isBuyer = dashboard.role === 'buyer';
  const isSeller = dashboard.role === 'seller';

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(135deg,_rgba(47,93,80,0.96)_0%,_rgba(95,130,103,0.92)_55%,_rgba(217,185,130,0.86)_100%)] p-8 text-white shadow-[0_24px_70px_-34px_rgba(29,51,42,0.75)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Impact dashboard</p>
        <h1 className="mt-3 font-heading text-5xl">{isSeller ? 'Track your listings, sales, and marketplace momentum.' : 'See every purchase turn into measurable savings.'}</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {isBuyer ? <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Purchases" value={dashboard.purchaseCount} /> : null}
          {isSeller ? <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Total listings" value={dashboard.totalListings} /> : null}
          {isSeller ? <StatCard icon={<Leaf className="h-5 w-5" />} label="Active listings" value={dashboard.activeListings} /> : null}
          {isSeller ? <StatCard icon={<Recycle className="h-5 w-5" />} label="Sold listings" value={dashboard.soldListingCount} /> : null}
          {isSeller ? <StatCard icon={<Droplets className="h-5 w-5" />} label="Sales value" value={`$${dashboard.totalSalesValue.toFixed(2)}`} /> : null}
          {isBuyer ? <StatCard icon={<Droplets className="h-5 w-5" />} label="Water saved" value={`${Math.round(dashboard.totalWaterSavedLiters)} L`} /> : null}
          {isBuyer ? <StatCard icon={<Recycle className="h-5 w-5" />} label="CO2 diverted" value={`${dashboard.totalCo2DivertedKg.toFixed(1)} kg`} /> : null}
          {isBuyer ? <StatCard icon={<Award className="h-5 w-5" />} label="Badges" value={dashboard.badges.length} /> : null}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        {isBuyer ? (
          <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-[#4e7f74]" />
              <h2 className="font-heading text-3xl text-stone-900">Sustainable badges</h2>
            </div>
            <div className="mt-6 space-y-4">
              {dashboard.badges.length === 0 ? <p className="text-stone-600">Your first purchase unlocks Circular Citizen.</p> : null}
              {dashboard.badges.map((badge) => (
                <div key={badge.slug} className="rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-[#4e7f74]">{badge.slug.replace('-', ' ')}</p>
                  <p className="mt-2 text-xl font-semibold text-stone-900">{badge.title}</p>
                  <p className="mt-2 text-sm text-stone-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-[#4e7f74]" />
              <h2 className="font-heading text-3xl text-stone-900">Active listings</h2>
            </div>
            <div className="mt-6 space-y-4">
              {dashboard.activeListingItems.length === 0 ? <p className="text-stone-600">You do not have any active listings right now.</p> : dashboard.activeListingItems.map((listing) => (
                <div key={listing.id} className="grid gap-3 rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">{listing.title}</p>
                    <p className="text-sm text-stone-600">{listing.materialName} · {listing.conditionLabel} · Eco {listing.ecoScoreGrade}</p>
                  </div>
                  <div className="text-sm text-stone-700 md:text-right">
                    <p>${listing.price.toFixed(2)}</p>
                    <p>Listed {new Date(listing.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Leaf className="h-5 w-5 text-[#4e7f74]" />
            <h2 className="font-heading text-3xl text-stone-900">{isSeller ? 'Sales history' : 'Purchase history'}</h2>
          </div>
          <div className="mt-6 space-y-4">
            {isBuyer && dashboard.purchases.length === 0 ? <p className="text-stone-600">No purchases yet. Use the quick purchase area below to test the full impact flow.</p> : null}
            {isSeller && dashboard.recentSales.length === 0 ? <p className="text-stone-600">No sales yet. Your sold listings will appear here.</p> : null}
            {(isSeller ? dashboard.recentSales : dashboard.purchases).map((purchase) => (
              <div key={purchase.id} className="grid gap-3 rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-lg font-semibold text-stone-900">{purchase.title}</p>
                  <p className="text-sm text-stone-600">{purchase.materialName} · {purchase.conditionLabel} · Eco {purchase.ecoScoreGrade}</p>
                </div>
                <div className="text-sm text-stone-700 md:text-right">
                  {isBuyer ? (
                    <>
                      <p>{Math.round(purchase.waterSavedLiters)} L saved</p>
                      <p>{purchase.co2DivertedKg.toFixed(1)} kg CO2 diverted</p>
                    </>
                  ) : (
                    <>
                      <p>${purchase.price.toFixed(2)}</p>
                      <p>Sold {new Date(purchase.soldAt).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isBuyer ? (
        <section className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-[#4e7f74]" />
            <h2 className="font-heading text-3xl text-stone-900">Quick purchase test</h2>
          </div>
          <p className="mt-3 text-stone-600">This panel helps verify the course flow end-to-end: available products, buyer purchase, and dashboard totals increasing immediately.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(productsQuery.data?.products || []).filter((product) => product.seller.id !== user?.id).map((product) => (
              <div key={product.id} className="rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">{product.title}</p>
                    <p className="text-sm text-stone-600">{product.material.name} · Eco {product.ecoScoreGrade}</p>
                  </div>
                  <p className="text-lg font-semibold text-stone-900">${product.price.toFixed(2)}</p>
                </div>
                <button type="button" onClick={() => purchaseMutation.mutate(product.id)} disabled={purchaseMutation.isPending} className="mt-4 rounded-full bg-[#2f5d50] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  Buy and add impact
                </button>
              </div>
            ))}
            {productsQuery.data?.products?.length === 0 ? <p className="text-stone-600">No available products yet. Create one from the sell page using a different account than the buyer account.</p> : null}
          </div>

          {purchaseMutation.isError ? <p className="mt-4 text-sm text-rose-600">{purchaseMutation.error.message}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function DashboardState({ message, tone = 'default' }) {
  return (
    <section className={`rounded-[2rem] border px-6 py-10 text-center ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-stone-300/60 bg-white/80 text-stone-600'}`}>
      <Leaf className="mx-auto mb-4 h-6 w-6" />
      <p>{message}</p>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
      {icon}
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="text-sm text-white/75">{label}</p>
    </div>
  );
}
