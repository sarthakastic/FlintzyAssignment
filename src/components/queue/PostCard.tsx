import { Clock, MoreHorizontal } from "lucide-react"
import { PlatformIcon } from "@/components/queue/PlatformIcon"
import { StatusBadge } from "@/components/queue/StatusBadge"
import type { Post } from "@/types/post"

type PostCardProps = {
  post: Post
  onRetry?: (post: Post) => void
}

function formatLocalTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function PostCard({ post, onRetry }: PostCardProps) {
  return (
    <article className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
      {post.mediaUrl ? (
        <img
          src={post.mediaUrl}
          alt=""
          className="h-16 w-full rounded-xl object-cover sm:h-[58px] sm:w-20"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-5 font-medium text-foreground">
          {post.content}
        </p>
        {post.status === "failed" && post.errorMessage ? (
          <p className="mt-1 text-xs text-destructive">{post.errorMessage}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="flex items-center gap-1.5">
          {post.platforms.map((platform) => (
            <PlatformIcon key={platform} platform={platform} />
          ))}
        </div>
        <span aria-hidden="true" className="hidden h-8 w-px bg-border sm:block" />
        <div className="min-w-[92px]">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock aria-hidden="true" className="size-3.5 text-muted-foreground" />
            {formatLocalTime(post.scheduledAt)}
          </p>
          <p className="mt-0.5 pl-5 text-[11px] text-muted-foreground">Local time</p>
        </div>
        <StatusBadge status={post.status} />
        {post.status === "failed" && onRetry ? (
          <button
            type="button"
            className="h-8 rounded-full px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onRetry(post)}
          >
            Retry
          </button>
        ) : (
          <button
            type="button"
            aria-label={`More actions for ${post.content}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </article>
  )
}
