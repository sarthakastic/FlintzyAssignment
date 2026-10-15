import { Sparkles } from "lucide-react"

type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-3xl pt-2">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        Coming next
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      <div className="soft-card mt-6 px-6 py-14 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-4 text-sm font-semibold">
          This section will be implemented in a later milestone.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Navigation is ready. Post management for {title.toLowerCase()} is not
          part of this milestone.
        </p>
      </div>
    </section>
  )
}
