export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#4e7f74]">{eyebrow}</p>
        <h1 className="mt-3 font-heading text-4xl leading-tight text-stone-900 sm:text-5xl">{title}</h1>
        <p className="mt-3 text-base text-stone-600 sm:text-lg">{description}</p>
      </div>
      {action}
    </div>
  );
}
