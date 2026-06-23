import { Cloud, Droplets, Heart, Leaf } from 'lucide-react';

const gradeStyles = {
  A: 'bg-[#556b5d] text-white',
  B: 'bg-[#6b826b] text-white',
  C: 'bg-[#c1a68d] text-white',
  D: 'bg-[#c88f7b] text-white',
  E: 'bg-[#b0705b] text-white',
};

export function ProductCard({ product }) {
  return (
    <article className="group cursor-pointer">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-[#e5e5e5]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        
        <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md ${gradeStyles[product.ecoScoreGrade] || gradeStyles.E}`}>
          <Leaf className="h-3 w-3" /> ECO {product.ecoScoreGrade}
        </div>
        
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-sm backdrop-blur-md transition hover:scale-105 hover:text-rose-500">
           <Heart className={`h-4 w-4 ${product.isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl text-stone-900 line-clamp-1">{product.title}</h3>
          <p className="font-sans text-sm font-semibold text-stone-900">${product.price.toFixed(2)}</p>
        </div>
        
        <p className="font-sans text-[10px] uppercase tracking-widest text-stone-500">
          {product.material.name} &middot; {product.conditionLabel.toUpperCase()}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3 w-3" />
            <span>{Math.round(product.waterSavedLiters).toLocaleString()}L saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="h-3 w-3" />
            <span>{product.co2DivertedKg.toFixed(1)}kg CO₂</span>
          </div>
        </div>
      </div>
    </article>
  );
}
