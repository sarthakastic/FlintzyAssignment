import type { Platform } from "@/features/posts/postsTypes"
import { platformConfig } from "@/lib/platform"
import { cn } from "@/lib/utils"

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M14.2 20v-6.2h2.1l.3-2.4h-2.4V9.8c0-.7.2-1.2 1.2-1.2H16.7V6.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v1.5H8.8v2.4h2.3V20h3.1Z"
      />
    </svg>
  )
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
      <path
        fill="currentColor"
        d="M14.7 6h2.2l-4.8 5.5L17.6 18h-3.3l-2.6-3.4L8.6 18H6.4l5.1-5.9L6.6 6h3.4l2.3 3.1L14.7 6Zm-.8 10.8h1.2L10.2 7.1H8.9l5 9.7Z"
      />
    </svg>
  )
}

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M14.2 4c.4 2.4 1.8 4 4.1 4.3v2.3c-1.4 0-2.7-.4-3.9-1.2v5.8a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.5a3 3 0 1 0 2.1 2.9V4h2.3Z"
      />
    </svg>
  )
}

const marks = {
  instagram: InstagramMark,
  facebook: FacebookMark,
  x: XMark,
  tiktok: TikTokMark,
}

const tones: Record<Platform, string> = {
  instagram: "bg-instagram-soft text-instagram",
  facebook: "bg-facebook-soft text-facebook",
  x: "bg-mono-soft text-mono",
  tiktok: "bg-mono-soft text-mono",
}

type PlatformIconProps = {
  platform: Platform
  className?: string
  decorative?: boolean
}

export function PlatformIcon({ platform, className, decorative = false }: PlatformIconProps) {
  const Mark = marks[platform]

  return (
    <span
      title={platformConfig[platform].label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full",
        tones[platform],
        className,
      )}
    >
      <Mark />
      {decorative ? null : <span className="sr-only">{platformConfig[platform].label}</span>}
    </span>
  )
}
