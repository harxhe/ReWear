import { useQuery } from '@tanstack/react-query';
import { Droplets, Heart, Leaf, Pencil, Recycle, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

export function AccountPage() {
  const { token, user } = useAuth();

  const profileQuery = useQuery({
    queryFn: () => apiRequest('/users/me/profile', {
      headers: authHeaders(token),
    }),
    queryKey: ['profile', token],
  });

  const wishlistQuery = useQuery({
    enabled: user?.role === 'buyer',
    queryFn: () => apiRequest('/wishlist', {
      headers: authHeaders(token),
    }),
    queryKey: ['wishlist', token],
  });

  if (profileQuery.isLoading) {
    return <ProfileState message="Loading your profile..." />;
  }

  if (profileQuery.isError) {
    return <ProfileState message="Your profile could not load right now." tone="error" />;
  }

  const { profile } = profileQuery.data;
  const isBuyer = profile.role === 'buyer';
  const isSeller = profile.role === 'seller';
  const firstInitial = profile.fullName?.[0] || 'U';

  return (
    <div className="space-y-16 py-8">
      <section className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-stone-200 pb-12">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c88f7b] text-4xl font-semibold text-white">
            {firstInitial}
          </div>
          <div>
            <h1 className="font-heading text-5xl text-stone-900">{profile.fullName}</h1>
            <p className="mt-2 text-stone-600">{profile.email}</p>
            <div className="mt-4 inline-flex items-center gap-2">
              <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-bold uppercase tracking-widest text-stone-500">
                {profile.role}
              </span>
              <span className="text-xs text-stone-400">
                Member since {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isSeller ? <ProfileMetric icon={<Store className="h-4 w-4" />} label="Total listings" value={profile.totalListings} /> : null}
        {isBuyer ? <ProfileMetric icon={<ShoppingBag className="h-4 w-4" />} label="Total purchases" value={profile.totalPurchases} /> : null}
        {isSeller ? <ProfileMetric icon={<ShoppingBag className="h-4 w-4" />} label="Sold listings" value={profile.soldListings} /> : null}
        {isBuyer ? <ProfileMetric icon={<Droplets className="h-4 w-4" />} label="Water saved" value={`${Math.round(profile.totalWaterSavedLiters).toLocaleString()} L`} /> : null}
        {isSeller ? <ProfileMetric icon={<Droplets className="h-4 w-4" />} label="Active listings" value={profile.availableListings} /> : null}
        {isBuyer ? <ProfileMetric icon={<Recycle className="h-4 w-4" />} label="CO₂ diverted" value={`${profile.totalCo2DivertedKg.toFixed(1)} kg`} /> : null}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-8">
          <h2 className="font-heading text-2xl text-stone-800">Activity Overview</h2>
          <div className="mt-8 space-y-4 text-stone-700">
            {isSeller ? (
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <p className="font-sans text-sm font-semibold text-stone-900">Seller activity</p>
                <p className="text-sm text-stone-500">{profile.availableListings} active &middot; {profile.soldListings} sold</p>
              </div>
            ) : null}
            {isBuyer ? (
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <p className="font-sans text-sm font-semibold text-stone-900">Buyer activity</p>
                <p className="text-sm text-stone-500">{profile.totalPurchases} completed purchases</p>
              </div>
            ) : null}
            {isBuyer ? (
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <p className="font-sans text-sm font-semibold text-stone-900">Wishlist</p>
                <p className="text-sm text-stone-500">{wishlistQuery.data?.wishlist?.length || 0} saved items</p>
              </div>
            ) : null}
          </div>
        </div>

        {isSeller ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-8">
            <h2 className="font-heading text-2xl text-stone-800">Recent listings</h2>
            <div className="mt-8 space-y-6">
              {profile.recentListings.length === 0 ? (
                <p className="text-sm text-stone-500">You have not created any listings yet.</p>
              ) : profile.recentListings.map((listing) => (
                <div key={listing.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-sm font-semibold text-stone-900">{listing.title}</p>
                        <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">{listing.category} &middot; {listing.status}</p>
                      </div>
                      <p className="text-sm text-stone-600">${listing.price.toFixed(2)}</p>
                    </div>
                    {listing.status !== 'sold' ? (
                      <div className="mt-2 text-right">
                        <Link to={`/sell?listing=${listing.id}`} className="text-xs font-bold tracking-widest text-[#556b5d] uppercase hover:underline">
                          Manage
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white p-8">
            <h2 className="font-heading text-2xl text-stone-800">Recent purchases</h2>
            <div className="mt-8 space-y-6">
              {profile.recentPurchases.length === 0 ? <p className="text-sm text-stone-500">You have not purchased anything yet.</p> : profile.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {purchase.imageUrl ? <img src={purchase.imageUrl} alt={purchase.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-sm font-semibold text-stone-900">{purchase.title}</p>
                        <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">{purchase.materialName} &middot; ECO {purchase.ecoScoreGrade}</p>
                      </div>
                      <p className="text-sm text-stone-600">${purchase.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {isBuyer ? (
        <section className="rounded-3xl border border-stone-200 bg-[#f0eae1]/50 p-8">
          <h2 className="font-heading text-2xl text-stone-800">Wishlist</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {(wishlistQuery.data?.wishlist || []).map((item) => (
              <Link key={item.id} to={`/purchase/${item.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-semibold text-stone-900">{item.title} <span className="ml-2 font-normal text-stone-500">${item.price.toFixed(2)}</span></p>
                  <p className="mt-1 text-[10px] tracking-widest text-stone-400 uppercase">Eco {item.ecoScoreGrade}</p>
                </div>
              </Link>
            ))}
            {(wishlistQuery.data?.wishlist || []).length === 0 ? <p className="text-sm text-stone-500">You have not saved any items yet.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProfileMetric({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        {icon}
      </div>
      <p className="font-noto text-4xl text-stone-900">{value}</p>
      <p className="mt-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">{label}</p>
    </div>
  );
}

function ProfileState({ message, tone = 'default' }) {
  return (
    <div className={`rounded-2xl border px-6 py-16 text-center ${tone === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-stone-200 bg-white/50 text-stone-500'}`}>
      <p>{message}</p>
    </div>
  );
}
