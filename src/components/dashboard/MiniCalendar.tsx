import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const weekdays = ["S", "M", "T", "W", "T", "F", "S"]

function buildCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function MiniCalendar() {
  const today = useMemo(() => new Date(), [])
  const [visible, setVisible] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selected, setSelected] = useState(today)
  const cells = buildCells(visible.getFullYear(), visible.getMonth())
  const title = visible.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="soft-card p-4" aria-label="Calendar">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() =>
              setVisible(new Date(visible.getFullYear(), visible.getMonth() - 1, 1))
            }
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() =>
              setVisible(new Date(visible.getFullYear(), visible.getMonth() + 1, 1))
            }
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-muted-foreground">
        {weekdays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />
          }

          const date = new Date(visible.getFullYear(), visible.getMonth(), day)
          const active = isSameDay(date, selected)

          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              aria-label={date.toLocaleDateString()}
              className={`mx-auto inline-flex size-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setSelected(date)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </section>
  )
}
