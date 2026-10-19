import { useState } from "react"
import { Clock, ImageIcon, LoaderCircle, RotateCw } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { PlatformIcon } from "@/components/queue/PlatformIcon"
import { StatusBadge } from "@/components/queue/StatusBadge"
import { selectRetryingIds } from "@/features/posts/postsSelectors"
import { retryPost } from "@/features/posts/postsThunks"
import { formatLocalTime } from "@/features/posts/postsUtils"
import type { Post } from "@/types/post"

type PostCardProps = {
  post: Post
}

function MediaPreview({ url }: { url?: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(url) && !failed

  if (!url) {
    return null
  }

  if (!showImage) {
    return (
      <span className="inline-flex h-16 w-full items-center justify-center rounded-xl bg-muted text-muted-foreground sm:h-[58px] sm:w-20">
        <ImageIcon aria-hidden="true" className="size-4" />
        <span className="sr-only">Image unavailable</span>
      </span>
    )
  }

  return (
    <img
      src={url}
      alt="Post image"
      className="h-16 w-full rounded-xl object-cover sm:h-[58px] sm:w-20"
      onError={() => setFailed(true)}
    />
  )
}

export function PostCard({ post }: PostCardProps) {
  const dispatch = useAppDispatch()
  const retrying = useAppSelector(selectRetryingIds).includes(post.id)
  const showRetry = post.status === "failed" || retrying

  function onRetry() {
    if (retrying) {
      return
    }

    void dispatch(retryPost(post.id))
  }

  return (
    <article className="flex min-w-0 flex-col gap-3 px-3.5 py-3.5 sm:flex-row sm:items-center sm:px-4">
      <MediaPreview url={post.mediaUrl} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-sm leading-5 font-medium break-words whitespace-pre-line text-foreground">
          {post.content}
        </p>
        {post.status === "failed" && post.errorMessage ? (
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-destructive">{post.errorMessage}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 lg:max-w-[560px] lg:flex-nowrap lg:justify-end">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.platforms.map((platform) => (
            <PlatformIcon key={platform} platform={platform} />
          ))}
        </div>
        <span aria-hidden="true" className="hidden h-8 w-px bg-border lg:block" />
        <div className="min-w-[92px]">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock aria-hidden="true" className="size-3.5 text-muted-foreground" />
            <time dateTime={post.scheduledAt}>{formatLocalTime(post.scheduledAt)}</time>
          </p>
          <p className="mt-0.5 pl-5 text-[11px] text-muted-foreground">Local time</p>
        </div>
        <StatusBadge status={post.status} />
        {showRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={retrying}
            aria-busy={retrying}
            onClick={onRetry}
          >
            {retrying ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <RotateCw aria-hidden="true" />
            )}
            {retrying ? "Retrying..." : "Retry"}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
