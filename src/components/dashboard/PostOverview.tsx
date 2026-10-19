import { CircleAlert, CircleCheck, Clock3 } from "lucide-react"
import { Link } from "react-router"
import { useAppSelector } from "@/app/hooks"
import {
  selectFailedCount,
  selectPublishedCount,
  selectScheduledCount,
} from "@/features/posts/postsSelectors"

const tiles = [
  {
    status: "scheduled" as const,
    label: "Scheduled",
    icon: Clock3,
    iconClass: "bg-accent text-primary",
  },
  {
    status: "published" as const,
    label: "Published",
    icon: CircleCheck,
    iconClass: "bg-success-soft text-success",
  },
  {
    status: "failed" as const,
    label: "Failed",
    icon: CircleAlert,
    iconClass: "bg-danger-soft text-destructive",
  },
]

export function PostOverview() {
  const scheduled = useAppSelector(selectScheduledCount)
  const published = useAppSelector(selectPublishedCount)
  const failed = useAppSelector(selectFailedCount)
  const countByStatus = { scheduled, published, failed }

  return (
    <section className="soft-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Post overview</h2>
        <p className="text-xs text-muted-foreground">All posts</p>
      </div>
      <ul className="flex flex-col gap-1">
        {tiles.map((tile) => {
          const Icon = tile.icon

          return (
            <li key={tile.status}>
              <Link
                to={{ pathname: "/queue", search: `?status=${tile.status}` }}
                className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={`inline-flex size-8 items-center justify-center rounded-xl ${tile.iconClass}`}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="flex-1 text-sm text-muted-foreground">{tile.label}</span>
                <span className="text-lg leading-none font-semibold">
                  {countByStatus[tile.status]}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
