export type PlatformId = "instagram" | "facebook" | "x" | "tiktok"

export type PostStatus = "scheduled" | "published" | "failed" | "draft"

export type Post = {
  id: string
  content: string
  platforms: PlatformId[]
  scheduledAt: string
  status: PostStatus
  mediaUrl?: string
  errorMessage?: string
}
