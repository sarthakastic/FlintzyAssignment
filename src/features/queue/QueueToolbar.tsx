import { ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Platform, PostStatus } from "@/features/posts/postsTypes"
import { platformConfig, supportedPlatforms } from "@/lib/platform"
import { ViewSwitcher } from "@/features/queue/ViewSwitcher"
import { cn } from "@/lib/utils"

type Option = {
  id: string
  label: string
  dotClassName: string
}

const platformDots: Record<Platform, string> = {
  instagram: "bg-instagram",
  facebook: "bg-facebook",
  x: "bg-mono",
  tiktok: "bg-mono",
}

const platformOptions: Option[] = [
  { id: "all", label: "All Platforms", dotClassName: "bg-violet-500" },
  ...supportedPlatforms.map((platform) => ({
    id: platform,
    label: platformConfig[platform].label,
    dotClassName: platformDots[platform],
  })),
]

const statusLabels: Record<PostStatus, { label: string; dotClassName: string }> = {
  scheduled: { label: "Scheduled", dotClassName: "bg-emerald-400" },
  published: { label: "Published", dotClassName: "bg-sky-500" },
  failed: { label: "Failed", dotClassName: "bg-rose-500" },
}

const statusOptions: Option[] = [
  { id: "all", label: "All Status", dotClassName: "bg-emerald-500" },
  ...(Object.keys(statusLabels) as PostStatus[]).map((status) => ({
    id: status,
    label: statusLabels[status].label,
    dotClassName: statusLabels[status].dotClassName,
  })),
]

function PillSelect({
  options,
  value,
  label,
  onChange,
}: {
  options: Option[]
  value: string
  label: string
  onChange: (id: string) => void
}) {
  const selected = options.find((option) => option.id === value) ?? options[0]

  return (
    <div className="relative inline-flex">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full",
          selected.dotClassName,
        )}
      />
      <select
        aria-label={label}
        value={selected.id}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-border bg-card pr-8 pl-7 text-sm font-medium control-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

type QueueToolbarProps = {
  platform: Platform | null
  status: PostStatus | null
  search: string
  showClear: boolean
  onPlatformChange: (platform: Platform | null) => void
  onStatusChange: (status: PostStatus | null) => void
  onSearchChange: (value: string) => void
  onClear: () => void
}

export function QueueToolbar({
  platform,
  status,
  search,
  showClear,
  onPlatformChange,
  onStatusChange,
  onSearchChange,
  onClear,
}: QueueToolbarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <PillSelect
          options={platformOptions}
          value={platform ?? "all"}
          label="Filter by platform"
          onChange={(id) => onPlatformChange(id === "all" ? null : (id as Platform))}
        />
        <PillSelect
          options={statusOptions}
          value={status ?? "all"}
          label="Filter by status"
          onChange={(id) => onStatusChange(id === "all" ? null : (id as PostStatus))}
        />
        {showClear ? (
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClear}
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search by content"
          placeholder="Search by content..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 w-full rounded-full border-border bg-card pl-10 control-shadow"
        />
      </div>
      <ViewSwitcher />
    </div>
  )
}
