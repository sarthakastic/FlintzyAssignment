import type { Platform, Post, PostStatus } from "@/features/posts/postsTypes"
import { supportedPlatforms } from "@/lib/platform"

export type ActiveQueueFilters = {
  platform: Platform | null
  status: PostStatus | null
  search: string
}

const statuses = new Set<PostStatus>(["scheduled", "published", "failed"])

export function isPlatform(value: string): value is Platform {
  return supportedPlatforms.includes(value as Platform)
}

export function isPostStatus(value: string): value is PostStatus {
  return statuses.has(value as PostStatus)
}

export function readQueueFilters(params: URLSearchParams): ActiveQueueFilters {
  const platform = params.get("platform")
  const status = params.get("status")

  return {
    platform: platform && isPlatform(platform) ? platform : null,
    status: status && isPostStatus(status) ? status : null,
    search: (params.get("search") ?? "").trim(),
  }
}

export function withoutInvalidQueueFilters(params: URLSearchParams) {
  const next = new URLSearchParams(params)
  const platform = next.get("platform")
  const status = next.get("status")

  if (platform !== null && !isPlatform(platform)) {
    next.delete("platform")
  }

  if (status !== null && !isPostStatus(status)) {
    next.delete("status")
  }

  const search = next.get("search")
  if (search !== null && search.trim() === "") {
    next.delete("search")
  } else if (search !== null && search !== search.trim()) {
    next.set("search", search.trim())
  }

  return next
}

/**
 * `retryingIds` are posts with an optimistic status change in flight. They keep
 * matching the "failed" filter so a retry does not make the card vanish (and
 * reappear on rollback) mid-request.
 */
export function filterPosts(
  posts: Post[],
  filters: ActiveQueueFilters,
  retryingIds: readonly string[] = [],
) {
  const query = filters.search.trim().toLowerCase()

  return posts.filter((post) => {
    if (filters.platform && !post.platforms.includes(filters.platform)) {
      return false
    }

    const status = retryingIds.includes(post.id) ? "failed" : post.status
    if (filters.status && status !== filters.status) {
      return false
    }

    if (query && !post.content.toLowerCase().includes(query)) {
      return false
    }

    return true
  })
}
