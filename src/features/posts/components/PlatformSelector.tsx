import { PlatformIcon } from "@/components/queue/PlatformIcon"
import type { Platform } from "@/features/posts/postsTypes"
import { platformConfig, supportedPlatforms } from "@/lib/platform"
import { cn } from "@/lib/utils"

type PlatformSelectorProps = {
  value: Platform[]
  onChange: (platforms: Platform[]) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

export function PlatformSelector({
  value,
  onChange,
  disabled = false,
  invalid = false,
  describedBy,
}: PlatformSelectorProps) {
  function toggle(platform: Platform) {
    if (value.includes(platform)) {
      onChange(value.filter((item) => item !== platform))
      return
    }

    onChange([...value, platform])
  }

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      role="group"
      aria-label="Platforms"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      {supportedPlatforms.map((platform) => {
        const selected = value.includes(platform)
        const label = platformConfig[platform].label

        return (
          <button
            key={platform}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => toggle(platform)}
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              selected
                ? "border-primary bg-[#f3eefe] text-primary"
                : "border-[#eeeaf5] bg-white text-foreground hover:bg-muted",
            )}
          >
            <PlatformIcon platform={platform} decorative />
            {label}
          </button>
        )
      })}
    </div>
  )
}
