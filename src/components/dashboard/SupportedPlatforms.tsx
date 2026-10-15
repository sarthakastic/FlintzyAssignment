import { PlatformIcon } from "@/components/queue/PlatformIcon"
import { platformLabels, supportedPlatforms } from "@/lib/platforms"

export function SupportedPlatforms() {
  return (
    <section className="soft-card p-4">
      <h2 className="text-sm font-semibold">Supported platforms</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">No accounts connected</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {supportedPlatforms.map((platform) => (
          <li key={platform} className="flex items-center gap-3">
            <PlatformIcon platform={platform} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{platformLabels[platform]}</span>
              <span className="block text-xs text-muted-foreground">Not connected</span>
            </span>
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#d9d6e3]"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
