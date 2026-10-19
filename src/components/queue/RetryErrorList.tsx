import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectAllPosts, selectRetryErrors } from "@/features/posts/postsSelectors"
import { dismissRetryError } from "@/features/posts/postsSlice"
import { cn } from "@/lib/utils"

function excerpt(content: string) {
  const text = content.replace(/\s+/g, " ").trim()
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

/** Dismissible notices for retries that failed and were rolled back. */
export function RetryErrorList({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const retryErrors = useAppSelector(selectRetryErrors)
  const posts = useAppSelector(selectAllPosts)
  const entries = Object.entries(retryErrors)

  if (entries.length === 0) {
    return null
  }

  return (
    <ul role="alert" className={cn("flex flex-col gap-2", className)}>
      {entries.map(([id, message]) => {
        const post = posts.find((item) => item.id === id)

        return (
          <li key={id} className="soft-card flex items-center justify-between gap-3 px-4 py-3">
            <p className="min-w-0 text-sm text-destructive">
              <span className="font-medium">{message}</span>
              {post ? (
                <span className="block truncate text-xs text-muted-foreground">
                  “{excerpt(post.content)}”
                </span>
              ) : null}
            </p>
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => dispatch(dismissRetryError(id))}
            >
              Dismiss
            </button>
          </li>
        )
      })}
    </ul>
  )
}
