import type { RootState } from "@/app/store"
import type { PostStatus } from "@/features/posts/postsTypes"

export const selectAllPosts = (state: RootState) => state.posts.items

export const selectPostsLoading = (state: RootState) => state.posts.loading

export const selectPostsInitialized = (state: RootState) => state.posts.initialized

export const selectPostsError = (state: RootState) => state.posts.error

export const selectPostsCreating = (state: RootState) => state.posts.creating

export const selectRetryingIds = (state: RootState) => state.posts.retryingIds

export const selectRetryErrors = (state: RootState) => state.posts.retryErrors

function countByStatus(state: RootState, status: PostStatus) {
  return state.posts.items.filter((post) => post.status === status).length
}

export const selectScheduledCount = (state: RootState) => countByStatus(state, "scheduled")

export const selectPublishedCount = (state: RootState) => countByStatus(state, "published")

export const selectFailedCount = (state: RootState) => countByStatus(state, "failed")

export const selectTotalPostsCount = (state: RootState) => state.posts.items.length
