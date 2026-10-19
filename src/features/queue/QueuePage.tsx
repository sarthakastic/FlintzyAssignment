import { Fragment, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Link, useLocation } from "react-router"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { DateGroup } from "@/components/queue/DateGroup"
import { PostCard } from "@/components/queue/PostCard"
import { PostQueueEmptyState } from "@/components/queue/PostQueueEmptyState"
import { PostQueueErrorState } from "@/components/queue/PostQueueErrorState"
import { PostQueueNoResults } from "@/components/queue/PostQueueNoResults"
import { PostQueueSkeleton } from "@/components/queue/PostQueueSkeleton"
import { MiniCalendar } from "@/components/dashboard/MiniCalendar"
import { PostOverview } from "@/components/dashboard/PostOverview"
import { SupportedPlatforms } from "@/components/dashboard/SupportedPlatforms"
import {
  selectAllPosts,
  selectPostsError,
  selectPostsInitialized,
  selectPostsLoading,
  selectRetryErrors,
  selectRetryingIds,
} from "@/features/posts/postsSelectors"
import { dismissRetryError } from "@/features/posts/postsSlice"
import { filterPosts } from "@/features/posts/postFilters"
import { fetchPosts, resetPosts } from "@/features/posts/postsThunks"
import { groupPostsByLocalDay } from "@/features/posts/postsUtils"
import { QueueToolbar } from "@/features/queue/QueueToolbar"
import { useQueueFilters } from "@/features/queue/useQueueFilters"

// Morning 5:00–11:59, afternoon 12:00–15:59, evening 16:00–4:59 (local time).
function greeting(now: Date) {
  const hour = now.getHours()

  if (hour >= 5 && hour < 12) {
    return "Good morning!"
  }

  if (hour >= 12 && hour < 16) {
    return "Good afternoon!"
  }

  return "Good evening!"
}

function excerpt(content: string) {
  const text = content.replace(/\s+/g, " ").trim()
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

// Re-renders once a minute so Today/Tomorrow labels roll over at midnight.
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}

export function QueuePage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [hideScheduledNotice, setHideScheduledNotice] = useState(false)
  const postScheduled =
    !hideScheduledNotice &&
    Boolean((location.state as { postScheduled?: boolean } | null)?.postScheduled)
  const posts = useAppSelector(selectAllPosts)
  const loading = useAppSelector(selectPostsLoading)
  const initialized = useAppSelector(selectPostsInitialized)
  const error = useAppSelector(selectPostsError)
  const retryErrors = useAppSelector(selectRetryErrors)
  const retryingIds = useAppSelector(selectRetryingIds)
  const filters = useQueueFilters()
  const now = useNow()
  const visiblePosts = useMemo(
    () =>
      filterPosts(
        posts,
        {
          platform: filters.platform,
          status: filters.status,
          search: filters.searchText,
        },
        retryingIds,
      ),
    [filters.platform, filters.searchText, filters.status, posts, retryingIds],
  )
  const groups = useMemo(() => groupPostsByLocalDay(visiblePosts, now), [visiblePosts, now])
  const firstPastKey = groups.find((group) => group.past)?.key
  const failedRetries = Object.entries(retryErrors).map(([id, message]) => ({
    id,
    message,
    post: posts.find((post) => post.id === id),
  }))

  function reloadPosts() {
    void dispatch(fetchPosts({ reload: true }))
  }

  function resetDemoData() {
    if (window.confirm("Replace all saved posts with the original demo data?")) {
      void dispatch(resetPosts())
    }
  }

  return (
    <div className="mx-auto grid max-w-[1180px] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 left-24 h-28 w-72 rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_68%)]"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[32px] leading-none font-bold tracking-tight">
                {greeting(now)} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Here’s your content queue. Stay consistent, keep growing.
              </p>
            </div>
            <Button
              asChild
              className="h-11 shrink-0 rounded-full bg-primary px-4 text-primary-foreground shadow-[0_10px_20px_-12px_rgba(124,58,237,0.9)] hover:bg-primary-hover"
            >
              <Link to="/compose">
                <Plus data-icon="inline-start" aria-hidden="true" />
                Create Post
              </Link>
            </Button>
          </div>
        </div>

        {failedRetries.length > 0 ? (
          <ul role="alert" className="mt-6 flex flex-col gap-2">
            {failedRetries.map(({ id, message, post }) => (
              <li
                key={id}
                className="soft-card flex items-center justify-between gap-3 px-4 py-3"
              >
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
            ))}
          </ul>
        ) : null}

        {postScheduled ? (
          <div
            role="status"
            className="soft-card mt-6 flex items-center justify-between gap-3 px-4 py-3"
          >
            <p className="text-sm font-medium">Your post was scheduled.</p>
            <button
              type="button"
              className="text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setHideScheduledNotice(true)}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          <QueueToolbar
            platform={filters.platform}
            status={filters.status}
            search={filters.searchText}
            showClear={filters.hasActiveFilters}
            onPlatformChange={filters.setPlatform}
            onStatusChange={filters.setStatus}
            onSearchChange={filters.updateSearch}
            onClear={filters.clearFilters}
          />
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {!initialized && !error && posts.length === 0 ? <PostQueueSkeleton /> : null}
          {error && posts.length === 0 ? (
            <PostQueueErrorState
              message={error}
              retrying={loading}
              onRetry={reloadPosts}
              onReset={resetDemoData}
            />
          ) : null}
          {initialized && posts.length === 0 && !error ? <PostQueueEmptyState /> : null}
          {initialized && posts.length > 0 && visiblePosts.length === 0 ? (
            <PostQueueNoResults onClear={filters.clearFilters} />
          ) : null}
          {visiblePosts.length > 0 ? (
            <>
              {error ? (
                <div className="soft-card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={loading}
                    onClick={reloadPosts}
                  >
                    {loading ? "Retrying…" : "Retry"}
                  </Button>
                </div>
              ) : null}
              {groups.map((group) => (
                <Fragment key={group.key}>
                  {group.key === firstPastKey ? (
                    <h2 className="flex items-center gap-3 px-1 pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Earlier
                      <span aria-hidden="true" className="h-px flex-1 bg-border" />
                    </h2>
                  ) : null}
                  <DateGroup
                    label={group.label}
                    detail={group.detail}
                    count={group.posts.length}
                  >
                    {group.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </DateGroup>
                </Fragment>
              ))}
            </>
          ) : null}
        </div>
      </div>

      <aside className="hidden flex-col gap-4 xl:flex">
        <MiniCalendar />
        <PostOverview />
        <SupportedPlatforms />
      </aside>
    </div>
  )
}
