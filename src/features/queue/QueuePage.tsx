import { useMemo } from "react"
import { Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { DateGroup } from "@/components/queue/DateGroup"
import { PostCard } from "@/components/queue/PostCard"
import { PostQueueEmptyState } from "@/components/queue/PostQueueEmptyState"
import { PostQueueErrorState } from "@/components/queue/PostQueueErrorState"
import { PostQueueSkeleton } from "@/components/queue/PostQueueSkeleton"
import { IdeaCard } from "@/components/dashboard/IdeaCard"
import { MiniCalendar } from "@/components/dashboard/MiniCalendar"
import { PostOverview } from "@/components/dashboard/PostOverview"
import { SupportedPlatforms } from "@/components/dashboard/SupportedPlatforms"
import {
  selectAllPosts,
  selectPostsError,
  selectPostsInitialized,
  selectPostsLoading,
} from "@/features/posts/postsSelectors"
import { fetchPosts } from "@/features/posts/postsThunks"
import { groupPostsByLocalDay } from "@/features/posts/postsUtils"
import { QueueToolbar } from "@/features/queue/QueueToolbar"

const composerReason = "The post composer will be added in a later milestone."

export function QueuePage() {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const loading = useAppSelector(selectPostsLoading)
  const initialized = useAppSelector(selectPostsInitialized)
  const error = useAppSelector(selectPostsError)
  const groups = useMemo(() => groupPostsByLocalDay(posts), [posts])

  function reloadPosts() {
    void dispatch(fetchPosts({ reload: true }))
  }

  return (
    <div className="mx-auto grid max-w-[1180px] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 left-24 h-28 w-72 rounded-full bg-[radial-gradient(circle,rgb(216_199_255/0.7),transparent_68%)]"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[32px] leading-none font-bold tracking-tight">
                Good morning! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Here’s your content queue. Stay consistent, keep growing.
              </p>
            </div>
            <span title={composerReason} className="shrink-0">
              <Button
                type="button"
                disabled
                aria-label={`Create Post. ${composerReason}`}
                className="h-11 rounded-full bg-primary px-4 text-primary-foreground shadow-[0_10px_20px_-12px_rgba(124,58,237,0.9)] hover:bg-[#6d28d9] disabled:opacity-100"
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Create Post
              </Button>
            </span>
          </div>
        </div>

        <div className="mt-6">
          <QueueToolbar />
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {!initialized && !error && posts.length === 0 ? <PostQueueSkeleton /> : null}
          {error && posts.length === 0 ? (
            <PostQueueErrorState message={error} retrying={loading} onRetry={reloadPosts} />
          ) : null}
          {initialized && posts.length === 0 && !error ? <PostQueueEmptyState /> : null}
          {posts.length > 0 ? (
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
                <DateGroup
                  key={group.key}
                  label={group.label}
                  detail={group.detail}
                  count={group.posts.length}
                >
                  {group.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </DateGroup>
              ))}
            </>
          ) : null}
        </div>
      </div>

      <aside className="hidden flex-col gap-4 xl:flex">
        <MiniCalendar />
        <PostOverview />
        <SupportedPlatforms />
        <IdeaCard />
      </aside>
    </div>
  )
}
