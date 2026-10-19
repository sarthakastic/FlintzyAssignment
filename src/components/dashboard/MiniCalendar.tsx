import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router"
import { useAppSelector } from "@/app/hooks"
import { selectAllPosts } from "@/features/posts/postsSelectors"
import { groupPostsByDateKey } from "@/features/posts/postsUtils"
import { isSameDay, monthGrid, toDateKey, weekdayNames } from "@/lib/dates"

export function MiniCalendar() {
  const today = useMemo(() => new Date(), [])
  const [visible, setVisible] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const posts = useAppSelector(selectAllPosts)
  const postsByDay = useMemo(() => groupPostsByDateKey(posts), [posts])
  const days = monthGrid(visible)
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
        {weekdayNames.map((name) => (
          <span key={name}>{name.charAt(0)}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
        {days.map((date) => {
          const dateKey = toDateKey(date)

          if (date.getMonth() !== visible.getMonth()) {
            return <span key={dateKey} />
          }

          const day = date.getDate()
          const isToday = isSameDay(date, today)
          const count = postsByDay.get(dateKey)?.length ?? 0
          const label = `${date.toLocaleDateString()}${count > 0 ? `, ${count} ${count === 1 ? "post" : "posts"}` : ""}`

          return (
            <Link
              key={day}
              to={{ pathname: "/calendar", search: `?date=${dateKey}` }}
              aria-label={`${label}. Open in calendar`}
              aria-current={isToday ? "date" : undefined}
              className={`relative mx-auto inline-flex size-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isToday ? "bg-primary font-semibold text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              {day}
              {count > 0 ? (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 size-1 rounded-full ${
                    isToday ? "bg-primary-foreground" : "bg-primary"
                  }`}
                />
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
