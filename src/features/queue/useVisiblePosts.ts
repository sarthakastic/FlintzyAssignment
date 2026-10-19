import { useMemo } from "react"
import { useAppSelector } from "@/app/hooks"
import { filterPosts } from "@/features/posts/postFilters"
import { selectAllPosts, selectRetryingIds } from "@/features/posts/postsSelectors"
import type { useQueueFilters } from "@/features/queue/useQueueFilters"

/** Posts matching the URL-driven queue filters, shared by the list and calendar views. */
export function useVisiblePosts(filters: ReturnType<typeof useQueueFilters>) {
  const posts = useAppSelector(selectAllPosts)
  const retryingIds = useAppSelector(selectRetryingIds)

  return useMemo(
    () =>
      filterPosts(
        posts,
        { platform: filters.platform, status: filters.status, search: filters.searchText },
        retryingIds,
      ),
    [filters.platform, filters.searchText, filters.status, posts, retryingIds],
  )
}
