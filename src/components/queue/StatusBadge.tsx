import type { PostStatus } from "@/types/post"
import { cn } from "@/lib/utils"

const styles: Record<PostStatus, string> = {
  scheduled: "bg-[#e8f8ee] text-[#178a45]",
  published: "bg-[#e8f1ff] text-[#2f6fe0]",
  failed: "bg-[#fdecec] text-[#e11d48]",
  draft: "bg-[#f4f1ea] text-[#9a6b16]",
}

const labels: Record<PostStatus, string> = {
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
  draft: "Draft",
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
