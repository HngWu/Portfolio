interface PageHeroProps {
  typeLabel: string
  title: string
  descriptor: string
}

export function PageHero({ typeLabel, title, descriptor }: PageHeroProps) {
  return (
    <div className="mb-16">
      <div className="text-[0.6875rem] font-mono tracking-widest text-[var(--lume-primary)] uppercase mb-4">
        {typeLabel}
      </div>
      <h1 className="text-4xl md:text-5xl font-display text-white/90 mb-4">{title}</h1>
      <p className="text-lg text-white/60 max-w-2xl">{descriptor}</p>
      
      <div className="h-[1px] w-full bg-white/10 mt-12" />
    </div>
  )
}
