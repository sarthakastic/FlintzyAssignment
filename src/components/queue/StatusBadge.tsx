import type { PostStatus } from "@/features/posts/postsTypes"
import { cn } from "@/lib/utils"

const styles: Record<PostStatus, string> = {
  scheduled: "bg-success-soft text-success",
  published: "bg-info-soft text-info",
  failed: "bg-danger-soft text-destructive",
}

const labels: Record<PostStatus, string> = {
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
}

type StatusBadgeProps = {
  status: PostStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  )
}
