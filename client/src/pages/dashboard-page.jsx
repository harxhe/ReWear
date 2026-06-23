import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Cloud, Droplets, Leaf, Recycle, ShoppingBag } from 'lucide-react';

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
  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="space-y-16 py-8">
      <section className="max-w-2xl">
        <p className="text-[10px] font-bold tracking-widest text-[#556b5d] uppercase">
          Dashboard &middot; {isBuyer ? 'Buyer View' : 'Seller View'}
        </p>
        <h1 className="mt-6 font-heading text-6xl text-stone-900 md:text-7xl">
          Hello, <em className="italic text-[#556b5d]">{firstName}</em>.
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          {isSeller ? 'Your active archive and marketplace momentum.' : 'Your living ledger of impact, every garment counted.'}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {isBuyer ? (
          <>
            <StatCard bg="bg-[#556b5d]" text="text-white" icon={<Droplets className="h-4 w-4" />} label="Water saved" value={`${Math.round(dashboard.totalWaterSavedLiters).toLocaleString()} L`} />
            <StatCard bg="bg-[#c88f7b]" text="text-white" icon={<Cloud className="h-4 w-4" />} label="CO₂ diverted" value={`${dashboard.totalCo2DivertedKg.toFixed(1)} kg`} />
            <StatCard bg="bg-white" text="text-stone-900" icon={<ShoppingBag className="h-4 w-4 text-stone-400" />} label="Pieces re-homed" value={dashboard.purchaseCount} border />
          </>
        ) : (
          <>
            <StatCard bg="bg-[#556b5d]" text="text-white" icon={<ShoppingBag className="h-4 w-4" />} label="Active listings" value={dashboard.activeListings} />
            <StatCard bg="bg-[#c88f7b]" text="text-white" icon={<Recycle className="h-4 w-4" />} label="Sold listings" value={dashboard.soldListingCount} />
            <StatCard bg="bg-white" text="text-stone-900" icon={<Droplets className="h-4 w-4 text-stone-400" />} label="Sales value" value={`$${dashboard.totalSalesValue.toFixed(2)}`} border />
          </>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {isBuyer ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-stone-800">Sustainable badges</h2>
              <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">{dashboard.badges.length} earned</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {dashboard.badges.length === 0 ? <p className="text-sm text-stone-500">Your first purchase unlocks Circular Citizen.</p> : null}
              {dashboard.badges.map((badge) => (
                <div key={badge.slug} className="rounded-2xl border border-stone-200 bg-[#eef3e7]/50 p-5">
                   <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#556b5d] text-white">
                      <Award className="h-4 w-4" />
                   </div>
                  <p className="font-sans text-sm font-semibold text-stone-900">{badge.title}</p>
                  <p className="mt-1 text-xs text-stone-500">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white p-8">
            <h2 className="font-heading text-2xl text-stone-800">Active listings</h2>
            <div className="mt-8 space-y-4">
              {dashboard.activeListingItems.length === 0 ? <p className="text-sm text-stone-500">You do not have any active listings right now.</p> : dashboard.activeListingItems.map((listing) => (
                <div key={listing.id} className="flex justify-between border-b border-stone-100 pb-4 last:border-0">
                  <div>
                    <p className="font-sans text-sm font-semibold text-stone-900">{listing.title}</p>
                    <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">{listing.materialName} &middot; ECO {listing.ecoScoreGrade}</p>
                  </div>
                  <p className="font-sans text-sm text-stone-600">${listing.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-stone-200 bg-white p-8">
          <h2 className="font-heading text-2xl text-stone-800">{isSeller ? 'Sales history' : 'Purchase history'}</h2>
          <div className="mt-8 space-y-4">
            {isBuyer && dashboard.purchases.length === 0 ? <p className="text-sm text-stone-500">No purchases yet. Use the quick purchase area below to test.</p> : null}
            {isSeller && dashboard.recentSales.length === 0 ? <p className="text-sm text-stone-500">No sales yet. Your sold listings will appear here.</p> : null}
            {(isSeller ? dashboard.recentSales : dashboard.purchases).map((purchase) => (
              <div key={purchase.id} className="flex justify-between border-b border-stone-100 pb-4 last:border-0">
                <div className="flex gap-4">
                  {purchase.imageUrl ? <img src={purchase.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-stone-100" /> : <div className="h-12 w-12 rounded-lg bg-stone-100" />}
                  <div>
                    <p className="font-sans text-sm font-semibold text-stone-900">{purchase.title}</p>
                    <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">
                      {isBuyer ? `${Math.round(purchase.waterSavedLiters)}L \u00B7 ${purchase.co2DivertedKg.toFixed(1)}kg` : `Sold ${new Date(purchase.soldAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <p className="font-sans text-sm text-stone-600">${purchase.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isBuyer ? (
        <section className="rounded-3xl border border-stone-200 bg-[#f0eae1]/50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Quick Purchase Test</p>
              <h2 className="mt-2 font-heading text-3xl text-stone-900">Watch your impact move in real time.</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {(productsQuery.data?.products || []).filter((product) => product.seller.id !== user?.id).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
                <div>
                  <p className="font-sans text-sm font-semibold text-stone-900">{product.title} <span className="ml-2 font-normal text-stone-500">${product.price.toFixed(2)}</span></p>
                  <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">Eco {product.ecoScoreGrade}</p>
                </div>
                <button type="button" onClick={() => purchaseMutation.mutate(product.id)} disabled={purchaseMutation.isPending} className="rounded-full bg-[#556b5d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3f5246] disabled:opacity-50">
                  Buy
                </button>
              </div>
            ))}
            {productsQuery.data?.products?.length === 0 ? <p className="text-sm text-stone-500">No available products yet.</p> : null}
          </div>

          {purchaseMutation.isError ? <p className="mt-4 text-sm text-rose-600">{purchaseMutation.error.message}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function DashboardState({ message, tone = 'default' }) {
  return (
    <div className={`rounded-2xl border px-6 py-16 text-center ${tone === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-stone-200 bg-white/50 text-stone-500'}`}>
      <p>{message}</p>
    </div>
  );
}

function StatCard({ bg, text, icon, label, value, border }) {
  return (
    <div className={`rounded-3xl p-8 ${bg} ${text} ${border ? 'border border-stone-200 shadow-sm' : ''}`}>
      <div className={`mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full ${border ? 'bg-stone-100' : 'bg-white/20'}`}>
        {icon}
      </div>
      <p className="text-5xl font-noto tracking-tight">{value}</p>
      <p className={`mt-3 text-xs font-bold tracking-widest uppercase ${border ? 'text-stone-400' : 'text-white/70'}`}>{label}</p>
    </div>
  );
}
