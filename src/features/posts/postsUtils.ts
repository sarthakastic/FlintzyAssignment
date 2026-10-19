import type { Post } from "@/features/posts/postsTypes"

export type PostGroupData = {
  key: string
  label: string
  detail: string
  /** True for local days before today. */
  past: boolean
  posts: Post[]
}

export function isDue(post: Post, now = Date.now()) {
  return Date.parse(post.scheduledAt) <= now
}

// A successful retry re-queues a failed post. If its time has already passed it
// goes out straight away, so the confirmed status is "published".
export function retryOutcomeStatus(post: Post, now = Date.now()): Post["status"] {
  return isDue(post, now) ? "published" : "scheduled"
}

function parseTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatLocalDateKey(timestamp: string) {
  const date = parseTimestamp(timestamp)

  if (!date) {
    return "invalid"
  }

  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function getLocalDayLabel(timestamp: string, now = new Date()) {
  const date = parseTimestamp(timestamp)

  if (!date) {
    return "Unknown date"
  }

  const difference = Math.round(
    (startOfLocalDay(date).getTime() - startOfLocalDay(now).getTime()) / 86_400_000,
  )

  if (difference === 0) {
    return "Today"
  }

  if (difference === 1) {
    return "Tomorrow"
  }

  if (difference === -1) {
    return "Yesterday"
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  }).format(date)
}

export function formatLocalTime(timestamp: string) {
  const date = parseTimestamp(timestamp)

  if (!date) {
    return "—"
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatNearbyDate(timestamp: string) {
  const date = parseTimestamp(timestamp)

  if (!date) {
    return ""
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

const relativeLabels = new Set(["Today", "Tomorrow", "Yesterday"])

function compareScheduledAt(left: Post, right: Post) {
  const leftTime = Date.parse(left.scheduledAt)
  const rightTime = Date.parse(right.scheduledAt)
  const safeLeft = Number.isNaN(leftTime) ? Number.POSITIVE_INFINITY : leftTime
  const safeRight = Number.isNaN(rightTime) ? Number.POSITIVE_INFINITY : rightTime
  return safeLeft - safeRight
}

/**
 * Groups posts by local calendar day. Today and upcoming days come first in
 * chronological order, followed by past days with the most recent first.
 * Posts within a day are always chronological.
 */
export function groupPostsByLocalDay(posts: Post[], now = new Date()): PostGroupData[] {
  const todayKey = formatLocalDateKey(now.toISOString())
  const groups = new Map<string, PostGroupData>()

  for (const post of [...posts].sort(compareScheduledAt)) {
    const key = formatLocalDateKey(post.scheduledAt)
    const existing = groups.get(key)

    if (existing) {
      existing.posts.push(post)
      continue
    }

    const label = getLocalDayLabel(post.scheduledAt, now)

    groups.set(key, {
      key,
      label,
      detail: relativeLabels.has(label) ? formatNearbyDate(post.scheduledAt) : "",
      past: key !== "invalid" && key < todayKey,
      posts: [post],
    })
  }

  const all = [...groups.values()]
  const upcoming = all.filter((group) => !group.past)
  const past = all.filter((group) => group.past).reverse()
  return [...upcoming, ...past]
}
