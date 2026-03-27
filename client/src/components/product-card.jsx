import { Droplets, Leaf, Recycle } from 'lucide-react';

const gradeStyles = {
  A: 'bg-emerald-600 text-white',
  B: 'bg-lime-600 text-white',
  C: 'bg-amber-500 text-stone-900',
  D: 'bg-orange-500 text-white',
  E: 'bg-rose-600 text-white',
};

export function ProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-stone-300/60 bg-white/80 shadow-[0_20px_60px_-30px_rgba(55,45,32,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_-28px_rgba(55,45,32,0.55)]">
      <div className="relative h-72 bg-[linear-gradient(135deg,_#c6d4b2_0%,_#efe3d0_55%,_#d8cab1_100%)] p-6">
        <div className={`absolute right-5 top-5 rounded-full px-4 py-2 text-sm font-bold ${gradeStyles[product.ecoScoreGrade] || gradeStyles.E}`}>
          Eco {product.ecoScoreGrade}
        </div>
        <div className="flex h-full items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-600">{product.category}</p>
            <h3 className="mt-3 max-w-[13rem] font-heading text-3xl text-stone-900">{product.title}</h3>
          </div>
          <div className="rounded-full border border-white/70 bg-white/60 px-4 py-3 text-sm font-medium text-stone-700 backdrop-blur">
            {product.material.name}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Sold by {product.seller.name}</p>
            <p className="mt-1 text-sm text-stone-600">{product.conditionLabel}</p>
          </div>
          <p className="text-2xl font-semibold text-stone-900">${product.price.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-stone-700">
          <div className="rounded-2xl bg-[#eef3e7] p-3">
            <Leaf className="mb-2 h-4 w-4 text-[#3b6b59]" />
            <p className="font-semibold">{product.ecoScoreNumeric}</p>
            <p className="text-xs text-stone-500">Eco score</p>
          </div>
          <div className="rounded-2xl bg-[#f3eee4] p-3">
            <Droplets className="mb-2 h-4 w-4 text-[#4e7f74]" />
            <p className="font-semibold">{Math.round(product.waterSavedLiters)} L</p>
            <p className="text-xs text-stone-500">Water saved</p>
          </div>
          <div className="rounded-2xl bg-[#f1e6de] p-3">
            <Recycle className="mb-2 h-4 w-4 text-[#8c5b43]" />
            <p className="font-semibold">{product.co2DivertedKg.toFixed(1)} kg</p>
            <p className="text-xs text-stone-500">CO2 diverted</p>
          </div>
        </div>
      </div>
    </article>
  );
}
