import type { Post } from "@/types/post"
import {
  groupPostsByLocalDay,
  type PostGroupData,
} from "@/features/posts/postsUtils"

export type DateGroup = PostGroupData

export function groupPostsByDate(items: Post[], now = new Date()) {
  return groupPostsByLocalDay(items, now)
}

export function countPosts(items: Post[], status?: Post["status"]) {
  if (!status) {
    return items.length
  }

  return items.filter((post) => post.status === status).length
}
