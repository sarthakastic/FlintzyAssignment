import type { Post } from "@/types/post"

export type DateGroup = {
  key: string
  label: string
  detail: string
  posts: Post[]
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayKey(date: Date) {
  const day = startOfDay(date)
  const month = String(day.getMonth() + 1).padStart(2, "0")
  const dateNumber = String(day.getDate()).padStart(2, "0")
  return `${day.getFullYear()}-${month}-${dateNumber}`
}

function groupLabel(day: Date, today: Date) {
  const difference = Math.round(
    (startOfDay(day).getTime() - startOfDay(today).getTime()) / 86_400_000,
  )

  if (difference === 0) {
    return "Today"
  }

  if (difference === 1) {
    return "Tomorrow"
  }

  return day.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function groupPostsByDate(items: Post[], now = new Date()): DateGroup[] {
  const groups = new Map<string, DateGroup>()

  const sorted = [...items].sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime(),
  )

  for (const post of sorted) {
    const scheduled = new Date(post.scheduledAt)
    const key = dayKey(scheduled)
    const existing = groups.get(key)

    if (existing) {
      existing.posts.push(post)
      continue
    }

    groups.set(key, {
      key,
      label: groupLabel(scheduled, now),
      detail: scheduled.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      posts: [post],
    })
  }

  return [...groups.values()]
}

export function countPosts(items: Post[], status?: Post["status"]) {
  if (!status) {
    return items.length
  }

  return items.filter((post) => post.status === status).length
}
