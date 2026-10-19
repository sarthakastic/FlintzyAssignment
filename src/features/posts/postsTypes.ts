export type Platform = "facebook" | "instagram" | "x" | "tiktok"

export type PostStatus = "scheduled" | "published" | "failed"

const postStatuses: readonly PostStatus[] = ["scheduled", "published", "failed"]

export function isPostStatus(value: unknown): value is PostStatus {
  return postStatuses.includes(value as PostStatus)
}

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  mediaUrl?: string
  scheduledAt: string
  status: PostStatus
  errorMessage?: string
}

export interface CreatePostInput {
  content: string
  platforms: Platform[]
  mediaUrl?: string
  scheduledAt: string
}
