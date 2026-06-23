import { Cloud, Droplets, Leaf, Shirt } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../state/auth-context.js';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div className="bg-[#f8f6f0]">
      {/* HERO SECTION */}
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <header className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-6 py-6 md:px-12">
          <div className="flex items-center text-[#203c2b]">
            <span className="font-heading text-2xl tracking-wide">ReWear</span>
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-stone-600 transition hover:text-[#203c2b] hover:underline underline-offset-4">About Us</a>
            <a href="#ecoscore" className="text-sm font-medium text-stone-600 transition hover:text-[#203c2b] hover:underline underline-offset-4">What's Eco-Score?</a>
            <a href="#impact" className="text-sm font-medium text-stone-600 transition hover:text-[#203c2b] hover:underline underline-offset-4">Impact</a>
          </nav>
          
          <Link to="/login" className="rounded-full bg-[#1b3626] px-6 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#122419]">
            Start swapping &rarr;
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
          <div className="mb-10 flex items-center gap-3 rounded-full border border-white bg-white/60 px-5 py-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur-md">
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full border-2 border-[#f8f6f0] bg-[#829986]"></div>
              <div className="h-6 w-6 rounded-full border-2 border-[#f8f6f0] bg-[#a3b8a6]"></div>
              <div className="h-6 w-6 rounded-full border-2 border-[#f8f6f0] bg-[#5d6b60]"></div>
            </div>
            Style that leaves a smaller footprint.
          </div>

          <h1 className="font-heading text-6xl leading-[1.05] tracking-tight text-[#1b3626] md:text-[7rem]">
            Wear it again.<br />
            <em className="font-normal italic">Love it longer.</em>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-stone-600 leading-relaxed">
            ReWear is a thoughtfully curated marketplace for pre-loved clothing — giving beautiful pieces a second life, and your wardrobe a smaller footprint.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Link to="/login" className="w-full rounded-full bg-[#1b3626] px-8 py-4 text-sm font-semibold !text-white transition hover:bg-[#122419] sm:w-auto">
              Start your journey &rarr;
            </Link>
          </div>
        </main>
      </div>

      {/* EXPLANATORY CONTENT SECTION */}
      <section id="about" className="bg-white py-24 px-6 md:px-12 border-t border-stone-200">
        <div className="mx-auto max-w-5xl space-y-32">
          
          {/* Mission */}
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#556b5d] uppercase">What is ReWear?</p>
              <h2 className="mt-4 font-heading text-4xl text-stone-900 leading-tight">We believe fashion should be circular, not disposable.</h2>
              <p className="mt-6 text-stone-600 leading-relaxed">
                ReWear isn't just another thrift store. We are a community of conscious consumers actively tracking our impact. Every garment on our platform is evaluated for its material lifecycle and current condition, giving you full transparency into what you're buying.
              </p>
            </div>
            <div className="aspect-square rounded-3xl bg-[#f0eae1] p-8 flex items-center justify-center">
               <div className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm text-[#556b5d]">
                     <Shirt className="h-8 w-8" />
                  </div>
                  <p className="font-heading text-2xl text-stone-900">Curated & Verified</p>
                  <p className="text-sm text-stone-500">Only high-quality garments make it to the marketplace.</p>
               </div>
            </div>
          </div>

          {/* Eco-Score */}
          <div id="ecoscore" className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="order-2 md:order-1 aspect-square rounded-3xl bg-[#556b5d] p-8 text-white flex flex-col justify-center">
               <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase">The Grading Scale</p>
               <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                     <span className="font-heading text-4xl">A</span>
                     <span className="text-sm font-semibold uppercase tracking-wide">Exceptional</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 opacity-80">
                     <span className="font-heading text-4xl">B</span>
                     <span className="text-sm font-semibold uppercase tracking-wide">Great</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 opacity-60">
                     <span className="font-heading text-4xl">C</span>
                     <span className="text-sm font-semibold uppercase tracking-wide">Good</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 opacity-40">
                     <span className="font-heading text-4xl">D</span>
                     <span className="text-sm font-semibold uppercase tracking-wide">Fair</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 opacity-30">
                     <span className="font-heading text-4xl">E</span>
                     <span className="text-sm font-semibold uppercase tracking-wide">Heavy Impact</span>
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-[10px] font-bold tracking-widest text-[#556b5d] uppercase">Transparent Grading</p>
              <h2 className="mt-4 font-heading text-4xl text-stone-900 leading-tight">The ReWear Eco-Score.</h2>
              <p className="mt-6 text-stone-600 leading-relaxed">
                Before you buy or sell, our algorithm calculates an environmental score based on the material's origin and the item's current condition. A pristine cotton shirt has a different footprint than a heavily worn polyester jacket. We never hide the score.
              </p>
            </div>
          </div>

          {/* Impact Metrics */}
          <div id="impact" className="text-center">
            <p className="text-[10px] font-bold tracking-widest text-[#556b5d] uppercase">Measurable Impact</p>
            <h2 className="mt-4 font-heading text-4xl text-stone-900">Every purchase counts.</h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">When you buy a piece on ReWear, you aren't just saving money. You are actively diverting carbon emissions and saving water.</p>
            
            <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
               <div className="rounded-3xl border border-stone-200 p-8 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eae1] text-[#4e7f74] mb-6">
                     <Droplets className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-3xl text-stone-900">Water Saved</h3>
                  <p className="mt-3 text-sm text-stone-500">Track the liters of water you save by choosing pre-loved over new production.</p>
               </div>
               <div className="rounded-3xl border border-stone-200 p-8 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eae1] text-[#8c5b43] mb-6">
                     <Cloud className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-3xl text-stone-900">CO₂ Diverted</h3>
                  <p className="mt-3 text-sm text-stone-500">Watch your dashboard calculate the kilograms of greenhouse gases you've kept out of the atmosphere.</p>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="bg-[#1b3626] py-32 px-6 text-center text-white">
         <Leaf className="mx-auto h-8 w-8 text-white/50 mb-8" />
         <h2 className="font-heading text-5xl md:text-6xl max-w-2xl mx-auto leading-tight">Ready to refresh your closet?</h2>
         <p className="mt-6 text-white/70 max-w-xl mx-auto text-lg">Join thousands of others in the circular fashion movement.</p>
         <Link to="/login" className="mt-12 inline-block rounded-full bg-white px-10 py-4 text-sm font-semibold !text-[#1b3626] transition hover:bg-stone-100">
            Create an account today
         </Link>
      </footer>
    </div>
  );
}
