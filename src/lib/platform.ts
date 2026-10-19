import type { Platform } from "@/features/posts/postsTypes"

interface PlatformConfig {
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

export const supportedPlatforms: Platform[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok",
]

export function isPlatform(value: unknown): value is Platform {
  return supportedPlatforms.includes(value as Platform)
}
