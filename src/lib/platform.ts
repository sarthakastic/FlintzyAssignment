import type { Platform } from "@/features/posts/postsTypes"

export interface PlatformConfig {
  id: Platform
  label: string
  characterLimit: number
}

export const platformConfig = {
  facebook: {
    id: "facebook",
    label: "Facebook",
    characterLimit: 5000,
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    characterLimit: 2200,
  },
  x: {
    id: "x",
    label: "X",
    characterLimit: 280,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    characterLimit: 2200,
  },
} as const satisfies Record<Platform, PlatformConfig>

export const platformCharacterLimits: Record<Platform, number> = {
  facebook: platformConfig.facebook.characterLimit,
  instagram: platformConfig.instagram.characterLimit,
  x: platformConfig.x.characterLimit,
  tiktok: platformConfig.tiktok.characterLimit,
}

export const supportedPlatforms: Platform[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok",
]
