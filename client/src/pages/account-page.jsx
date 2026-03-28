import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Droplets, Leaf, Recycle, ShoppingBag, Store } from 'lucide-react';

import { apiRequest, authHeaders } from '../lib/api.js';
import { useAuth } from '../state/auth-context.js';

const roleStyles = {
  buyer: 'bg-[#e7efe8] text-[#2f5d50]',
  member: 'bg-stone-200 text-stone-700',
  seller: 'bg-[#efe3cd] text-[#8b5a32]',
};

export function AccountPage() {
  const { token } = useAuth();

  const profileQuery = useQuery({
    queryFn: () => apiRequest('/users/me/profile', {
      headers: authHeaders(token),
    }),
    queryKey: ['profile', token],
  });

  if (profileQuery.isLoading) {
    return <ProfileState message="Loading your profile..." />;
  }

  if (profileQuery.isError) {
    return <ProfileState message="Your profile could not load right now." tone="error" />;
  }

  const { profile } = profileQuery.data;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-300/60 bg-[linear-gradient(135deg,_rgba(47,93,80,0.96)_0%,_rgba(95,130,103,0.92)_58%,_rgba(217,185,130,0.86)_100%)] p-8 text-white shadow-[0_24px_70px_-34px_rgba(29,51,42,0.75)] sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Account profile</p>
            <h1 className="mt-3 font-heading text-5xl">{profile.fullName}</h1>
            <p className="mt-3 text-lg text-white/85">{profile.email}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <span key={role} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${roleStyles[role] || roleStyles.member}`}>
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Member since</p>
            <p className="mt-2 text-2xl font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfileMetric icon={<Store className="h-5 w-5 text-[#8b5a32]" />} label="Total listings" value={profile.totalListings} />
        <ProfileMetric icon={<ShoppingBag className="h-5 w-5 text-[#2f5d50]" />} label="Total purchases" value={profile.totalPurchases} />
        <ProfileMetric icon={<Droplets className="h-5 w-5 text-[#4e7f74]" />} label="Water saved" value={`${Math.round(profile.totalWaterSavedLiters)} L`} />
        <ProfileMetric icon={<Recycle className="h-5 w-5 text-[#8c5b43]" />} label="CO2 diverted" value={`${profile.totalCo2DivertedKg.toFixed(1)} kg`} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#4e7f74]" />
            <h2 className="font-heading text-3xl text-stone-900">Role overview</h2>
          </div>
          <div className="mt-6 space-y-4 text-stone-700">
            <div className="rounded-[1.5rem] bg-[#faf6f0] p-4">
              <p className="font-semibold text-stone-900">Seller activity</p>
              <p className="mt-2">{profile.availableListings} active listings and {profile.soldListings} sold listings.</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#faf6f0] p-4">
              <p className="font-semibold text-stone-900">Buyer activity</p>
              <p className="mt-2">{profile.totalPurchases} purchases completed through the marketplace.</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#faf6f0] p-4">
              <p className="font-semibold text-stone-900">Circular identity</p>
              <p className="mt-2">Roles are inferred from your real activity, so profiles feel correct even without a separate admin role system.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-300/60 bg-white/80 p-8 shadow-[0_18px_50px_-30px_rgba(55,45,32,0.45)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Leaf className="h-5 w-5 text-[#4e7f74]" />
            <h2 className="font-heading text-3xl text-stone-900">Recent listings</h2>
          </div>
          <div className="mt-6 space-y-4">
            {profile.recentListings.length === 0 ? (
              <p className="text-stone-600">You have not created any listings yet.</p>
            ) : profile.recentListings.map((listing) => (
              <div key={listing.id} className="flex gap-4 rounded-[1.5rem] border border-stone-300/60 bg-[#faf6f0] p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-stone-200">
                  {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{listing.title}</p>
                      <p className="text-sm text-stone-600">{listing.category} · Eco {listing.ecoScoreGrade}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">${listing.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileMetric({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-300/60 bg-white/80 p-5 shadow-[0_18px_40px_-32px_rgba(55,45,32,0.45)] backdrop-blur">
      {icon}
      <p className="mt-3 text-3xl font-semibold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

function ProfileState({ message, tone = 'default' }) {
  return (
    <section className={`rounded-[2rem] border px-6 py-10 text-center ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-stone-300/60 bg-white/80 text-stone-600'}`}>
      <Leaf className="mx-auto mb-4 h-6 w-6" />
      <p>{message}</p>
    </section>
  );
}
