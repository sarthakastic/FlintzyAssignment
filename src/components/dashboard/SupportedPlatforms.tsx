import { PlatformIcon } from "@/components/queue/PlatformIcon"
import { platformConfig, supportedPlatforms } from "@/lib/platform"

export function SupportedPlatforms() {
  return (
    <section className="soft-card p-4">
      <h2 className="text-sm font-semibold">Character limits</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Checked live in the composer</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {supportedPlatforms.map((platform) => (
          <li key={platform} className="flex items-center gap-3">
            <PlatformIcon platform={platform} decorative />
            <span className="min-w-0 flex-1 text-sm font-medium">
              {platformConfig[platform].label}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {platformConfig[platform].characterLimit.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
