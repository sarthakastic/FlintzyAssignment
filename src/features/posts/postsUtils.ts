import type { Post } from "@/features/posts/postsTypes"
import { startOfDay, toDateKey } from "@/lib/dates"

type PostGroupData = {
  key: string
  label: string
  detail: string
  /** True for local days before today. */
  past: boolean
  posts: Post[]
}

const utcTimestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/

/** ISO 8601 timestamp with an explicit offset, as stored for `scheduledAt`. */
export function isUtcTimestamp(value: string) {
  return utcTimestampPattern.test(value) && !Number.isNaN(Date.parse(value))
}

/** Copies a post so callers never share its `platforms` array. */
export function copyPost(post: Post): Post {
  return { ...post, platforms: [...post.platforms] }
}

export function copyPosts(posts: Post[]) {
  return posts.map(copyPost)
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

export function formatLocalDateKey(timestamp: string) {
  const date = parseTimestamp(timestamp)

  return date ? toDateKey(date) : "invalid"
}

function getLocalDayLabel(timestamp: string, now = new Date()) {
  const date = parseTimestamp(timestamp)

  if (!date) {
    return "Unknown date"
  }

  const difference = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
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

/** Posts keyed by local calendar day (`YYYY-MM-DD`), each day sorted chronologically. */
export function groupPostsByDateKey(posts: Post[]) {
  const byDay = new Map<string, Post[]>()

  for (const post of [...posts].sort(compareScheduledAt)) {
    const key = formatLocalDateKey(post.scheduledAt)
    const list = byDay.get(key)

    if (list) {
      list.push(post)
    } else {
      byDay.set(key, [post])
    }
  }

  return byDay
}
