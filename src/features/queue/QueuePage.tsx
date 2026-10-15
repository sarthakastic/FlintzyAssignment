import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateGroup } from "@/components/queue/DateGroup"
import { PostCard } from "@/components/queue/PostCard"
import { IdeaCard } from "@/components/dashboard/IdeaCard"
import { MiniCalendar } from "@/components/dashboard/MiniCalendar"
import { PostOverview } from "@/components/dashboard/PostOverview"
import { SupportedPlatforms } from "@/components/dashboard/SupportedPlatforms"
import { groupPostsByDate } from "@/features/queue/groupPosts"
import { posts } from "@/features/queue/posts"
import { QueueToolbar } from "@/features/queue/QueueToolbar"

const composerReason = "The post composer will be added in a later milestone."

export function QueuePage() {
  const groups = groupPostsByDate(posts)

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
          {groups.length === 0 ? (
            <div className="soft-card px-6 py-16 text-center">
              <h2 className="text-base font-semibold">Your queue is ready</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Your scheduled social media posts will appear here. Create a post
                to get started.
              </p>
            </div>
          ) : (
            groups.map((group) => (
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
            ))
          )}
        </div>
      </div>

      <aside className="hidden flex-col gap-4 xl:flex">
        <MiniCalendar />
        <PostOverview posts={posts} />
        <SupportedPlatforms />
        <IdeaCard />
      </aside>
    </div>
  )
}
