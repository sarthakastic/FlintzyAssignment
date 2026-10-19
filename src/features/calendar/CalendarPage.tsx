import { useEffect, useMemo, useRef, type KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { DateGroup } from "@/components/queue/DateGroup"
import { PostCard } from "@/components/queue/PostCard"
import { PostQueueErrorState } from "@/components/queue/PostQueueErrorState"
import { RetryErrorList } from "@/components/queue/RetryErrorList"
import type { Post, PostStatus } from "@/features/posts/postsTypes"
import {
  selectAllPosts,
  selectPostsError,
  selectPostsInitialized,
  selectPostsLoading,
} from "@/features/posts/postsSelectors"
import { formatLocalTime, groupPostsByDateKey } from "@/features/posts/postsUtils"
import { usePostsRecovery } from "@/features/posts/usePostsRecovery"
import { QueueToolbar } from "@/features/queue/QueueToolbar"
import { useQueueFilters } from "@/features/queue/useQueueFilters"
import { useVisiblePosts } from "@/features/queue/useVisiblePosts"
import {
  addDays,
  addMonths,
  isSameDay,
  monthGrid,
  parseDateKey,
  startOfDay,
  toDateKey,
  weekdayNames,
} from "@/lib/dates"
import { useNow } from "@/lib/useNow"
import { cn } from "@/lib/utils"

const maxChips = 3

const statusStyles: Record<PostStatus, { label: string; chip: string; dot: string }> = {
  scheduled: { label: "Scheduled", chip: "bg-success-soft text-success", dot: "bg-success" },
  published: { label: "Published", chip: "bg-info-soft text-info", dot: "bg-info" },
  failed: { label: "Failed", chip: "bg-danger-soft text-destructive", dot: "bg-destructive" },
}

const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" })
const fullDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})
const agendaFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" })

function describeDay(day: Date, posts: Post[]) {
  if (posts.length === 0) {
    return `${fullDateFormat.format(day)}, no posts`
  }

  const counts = (Object.keys(statusStyles) as PostStatus[])
    .map((status) => [status, posts.filter((post) => post.status === status).length] as const)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${status}`)

  return `${fullDateFormat.format(day)}, ${posts.length} ${posts.length === 1 ? "post" : "posts"}: ${counts.join(", ")}`
}

function oneLine(content: string) {
  return content.replace(/\s+/g, " ").trim()
}

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const posts = useAppSelector(selectAllPosts)
  const loading = useAppSelector(selectPostsLoading)
  const initialized = useAppSelector(selectPostsInitialized)
  const error = useAppSelector(selectPostsError)
  const filters = useQueueFilters()
  const visiblePosts = useVisiblePosts(filters)
  const { reloadPosts, resetDemoData } = usePostsRecovery()
  const now = useNow()
  const today = startOfDay(now)
  const gridRef = useRef<HTMLDivElement>(null)
  const focusSelectedOnRender = useRef(false)

  // The selected day lives in the URL (`?date=YYYY-MM-DD`) alongside the filters.
  const selected = parseDateKey(searchParams.get("date")) ?? today
  const selectedKey = toDateKey(selected)
  const days = monthGrid(selected)
  const postsByDay = useMemo(() => groupPostsByDateKey(visiblePosts), [visiblePosts])
  const selectedPosts = postsByDay.get(selectedKey) ?? []
  const monthPostCount = days
    .filter((day) => day.getMonth() === selected.getMonth())
    .reduce((total, day) => total + (postsByDay.get(toDateKey(day))?.length ?? 0), 0)

  useEffect(() => {
    if (!focusSelectedOnRender.current) {
      return
    }

    focusSelectedOnRender.current = false
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
  }, [selectedKey])

  function selectDate(date: Date, moveFocus = false) {
    focusSelectedOnRender.current = moveFocus
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set("date", toDateKey(date))
        return next
      },
      { replace: true },
    )
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

    if (event.key in offsets) {
      event.preventDefault()
      selectDate(addDays(selected, offsets[event.key]), true)
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault()
      selectDate(addMonths(selected, event.key === "PageUp" ? -1 : 1), true)
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      selectDate(addDays(selected, event.key === "Home" ? -selected.getDay() : 6 - selected.getDay()), true)
    }
  }

  const showLoading = !initialized && !error
  const loadFailed = Boolean(error) && posts.length === 0

  return (
    <div className="mx-auto max-w-[1180px] min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] leading-none font-bold tracking-tight">Calendar</h1>
          <p className="mt-2 text-sm text-muted-foreground">See every post across the month at a glance.</p>
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

      <RetryErrorList className="mt-6" />

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

      {loadFailed && error ? (
        <div className="mt-6">
          <PostQueueErrorState message={error} retrying={loading} onRetry={reloadPosts} onReset={resetDemoData} />
        </div>
      ) : (
        <>
          <section aria-labelledby="calendar-month" className="soft-card mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h2 id="calendar-month" className="text-base font-semibold" aria-live="polite">
                  {monthFormat.format(selected)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {showLoading
                    ? "Loading posts…"
                    : `${monthPostCount} ${monthPostCount === 1 ? "post" : "posts"} this month`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full px-3"
                  disabled={isSameDay(selected, today)}
                  onClick={() => selectDate(today)}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Previous month"
                  onClick={() => selectDate(addMonths(selected, -1))}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Next month"
                  onClick={() => selectDate(addMonths(selected, 1))}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground" aria-hidden="true">
              {weekdayNames.map((weekday) => (
                <span key={weekday} className="py-2">
                  <span className="sm:hidden">{weekday.charAt(0)}</span>
                  <span className="hidden sm:inline">{weekday}</span>
                </span>
              ))}
            </div>

            <div
              ref={gridRef}
              role="group"
              aria-label={`Days in ${monthFormat.format(selected)}. Use arrow keys to move between days.`}
              className="grid grid-cols-7"
              onKeyDown={onGridKeyDown}
            >
              {days.map((day, index) => {
                const key = toDateKey(day)
                const dayPosts = postsByDay.get(key) ?? []
                const inMonth = day.getMonth() === selected.getMonth()
                const isSelected = key === selectedKey
                const isToday = isSameDay(day, today)
                const overflow = dayPosts.length - maxChips

                return (
                  <button
                    key={key}
                    type="button"
                    tabIndex={isSelected ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={describeDay(day, dayPosts)}
                    onClick={() => selectDate(day)}
                    className={cn(
                      "flex min-h-16 min-w-0 flex-col gap-1 border-border p-1 text-left transition-colors hover:bg-muted/60 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-h-28 sm:p-1.5",
                      index % 7 !== 6 && "border-r",
                      index < days.length - 7 && "border-b",
                      !inMonth && "bg-muted/30",
                      isSelected && "bg-accent hover:bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center self-center rounded-full text-xs font-medium tabular-nums sm:self-start",
                        !inMonth && "text-muted-foreground/60",
                        isToday && "bg-primary font-semibold text-primary-foreground",
                        !isToday && isSelected && "text-accent-foreground font-semibold",
                      )}
                    >
                      {day.getDate()}
                    </span>

                    {dayPosts.length > 0 ? (
                      <>
                        <span className="flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden="true">
                          {dayPosts.slice(0, maxChips).map((post) => (
                            <span key={post.id} className={cn("size-1.5 rounded-full", statusStyles[post.status].dot)} />
                          ))}
                        </span>
                        <span className="hidden min-w-0 flex-col gap-0.5 sm:flex" aria-hidden="true">
                          {dayPosts.slice(0, maxChips).map((post) => (
                            <span
                              key={post.id}
                              className={cn(
                                "flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] leading-4",
                                statusStyles[post.status].chip,
                                !inMonth && "opacity-60",
                              )}
                            >
                              <span className="shrink-0 font-semibold tabular-nums">{formatLocalTime(post.scheduledAt)}</span>
                              <span className="truncate">{oneLine(post.content)}</span>
                            </span>
                          ))}
                          {overflow > 0 ? (
                            <span className="px-1.5 text-[11px] font-medium text-muted-foreground">+{overflow} more</span>
                          ) : null}
                        </span>
                      </>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground" aria-label="Legend">
            {(Object.keys(statusStyles) as PostStatus[]).map((status) => (
              <li key={status} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={cn("size-2 rounded-full", statusStyles[status].dot)} />
                {statusStyles[status].label}
              </li>
            ))}
          </ul>

          <section aria-label="Posts on the selected day" className="mt-6">
            {selectedPosts.length > 0 ? (
              <DateGroup
                label={isSameDay(selected, today) ? "Today" : agendaFormat.format(selected)}
                detail={isSameDay(selected, today) ? agendaFormat.format(selected) : ""}
                count={selectedPosts.length}
              >
                {selectedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </DateGroup>
            ) : (
              <div className="soft-card flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    {isSameDay(selected, today) ? "Today" : agendaFormat.format(selected)}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {showLoading
                      ? "Loading posts…"
                      : filters.hasActiveFilters
                        ? "No posts on this day match your filters."
                        : "Nothing scheduled on this day."}
                  </p>
                </div>
                {selected >= today && !showLoading ? (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to={{ pathname: "/compose", search: `?date=${selectedKey}` }}>
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Schedule a post
                    </Link>
                  </Button>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
