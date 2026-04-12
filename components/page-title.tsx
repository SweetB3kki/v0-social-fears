interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-semibold text-[var(--ink)] tracking-tight text-balance">{title}</h1>
      {subtitle && <p className="mt-2 text-[var(--ink-secondary)] text-base md:text-lg">{subtitle}</p>}
    </div>
  )
}
