import type { PlatformId } from "@/types/post"

export const platformLabels: Record<PlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
}

export const supportedPlatforms: PlatformId[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok",
]
