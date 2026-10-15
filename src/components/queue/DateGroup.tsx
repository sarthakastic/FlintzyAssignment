import type { ReactNode } from "react"

type DateGroupProps = {
  label: string
  detail: string
  count: number
  children: ReactNode
}

export function DateGroup({ label, detail, count, children }: DateGroupProps) {
  const countLabel = count === 1 ? "1 post" : `${count} posts`

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-[15px] font-semibold text-foreground">
          {label}{" "}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{detail}</span>
        </h2>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
      <div className="soft-card divide-y divide-border overflow-hidden">{children}</div>
    </section>
  )
}
