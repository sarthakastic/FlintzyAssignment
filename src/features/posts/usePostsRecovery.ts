import { useAppDispatch } from "@/app/hooks"
import { fetchPosts, resetPosts } from "@/features/posts/postsThunks"

/** Recovery actions offered when loading posts fails. */
export function usePostsRecovery() {
  const dispatch = useAppDispatch()

  return {
    reloadPosts() {
      void dispatch(fetchPosts({ reload: true }))
    },
    resetDemoData() {
      if (window.confirm("Replace all saved posts with the original demo data?")) {
        void dispatch(resetPosts())
      }
    },
  }
}
