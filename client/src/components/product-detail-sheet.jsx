import { Droplets, Leaf, Recycle, ShoppingBag, X } from 'lucide-react';

export function ProductDetailSheet({ canBuy, isBuying, onBuy, onClose, product }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-stone-950/35 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#fbf6ee] p-6 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.75)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#4e7f74]">Listing detail</p>
            <h2 className="mt-2 font-heading text-4xl text-stone-900">{product.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-stone-300 bg-white p-2 text-stone-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 rounded-[2rem] bg-[linear-gradient(135deg,_#c6d4b2_0%,_#efe3d0_55%,_#d8cab1_100%)] p-6">
          <div className="inline-flex rounded-full bg-[#2f5d50] px-4 py-2 text-sm font-semibold text-white">Eco {product.ecoScoreGrade}</div>
          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-600">{product.category}</p>
          <p className="mt-2 text-lg text-stone-700">{product.material.name} · {product.conditionLabel}</p>
          <p className="mt-6 text-3xl font-semibold text-stone-900">${product.price.toFixed(2)}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricCard icon={<Leaf className="h-5 w-5 text-[#3b6b59]" />} label="Eco score" value={String(product.ecoScoreNumeric)} />
          <MetricCard icon={<Droplets className="h-5 w-5 text-[#4e7f74]" />} label="Water saved" value={`${Math.round(product.waterSavedLiters)} L`} />
          <MetricCard icon={<Recycle className="h-5 w-5 text-[#8c5b43]" />} label="CO2 diverted" value={`${product.co2DivertedKg.toFixed(1)} kg`} />
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-stone-300/60 bg-white p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-[#4e7f74]">Why it scores this way</p>
          <p className="mt-3 text-stone-700">{product.description || 'This listing does not yet include a description.'}</p>
          <div className="mt-4 text-sm text-stone-600">
            <p>Seller: {product.seller.name}</p>
            <p>Status: {product.status}</p>
            <p>Material category: {product.material.category}</p>
          </div>
        </div>

        <div className="mt-auto pt-6">
          {canBuy ? (
            <button type="button" onClick={() => onBuy(product.id)} disabled={isBuying} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2f5d50] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              <ShoppingBag className="h-4 w-4" />
              {isBuying ? 'Purchasing...' : 'Buy this item'}
            </button>
          ) : (
            <div className="rounded-full border border-stone-300 bg-white px-5 py-3 text-center text-sm text-stone-600">
              Sign in with a buyer account to complete a purchase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-300/60 bg-white p-4">
      {icon}
      <p className="mt-3 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}
