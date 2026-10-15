import type { Platform } from "@/features/posts/postsTypes"
import { platformConfig, supportedPlatforms } from "@/lib/platform"

export const platformLabels: Record<Platform, string> = {
  facebook: platformConfig.facebook.label,
  instagram: platformConfig.instagram.label,
  x: platformConfig.x.label,
  tiktok: platformConfig.tiktok.label,
}

export { supportedPlatforms }
