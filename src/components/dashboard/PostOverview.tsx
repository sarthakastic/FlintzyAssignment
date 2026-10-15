import { CircleAlert, CircleCheck, Clock3, FilePenLine } from "lucide-react"
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
    iconClass: "bg-[#f3eefe] text-primary",
  },
  {
    status: "published" as const,
    label: "Published",
    icon: CircleCheck,
    iconClass: "bg-[#e8f8ee] text-[#178a45]",
  },
  {
    status: "failed" as const,
    label: "Failed",
    icon: CircleAlert,
    iconClass: "bg-[#fdecec] text-[#e11d48]",
  },
  {
    status: "draft" as const,
    label: "Drafts",
    icon: FilePenLine,
    iconClass: "bg-[#f4f1ea] text-[#9a6b16]",
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
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          const count = tile.status === "draft" ? 0 : countByStatus[tile.status]

          return (
            <div key={tile.status} className="flex items-center gap-2.5">
              <span
                className={`inline-flex size-8 items-center justify-center rounded-xl ${tile.iconClass}`}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span>
                <span className="block text-lg leading-none font-semibold">{count}</span>
                <span className="text-xs text-muted-foreground">{tile.label}</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
