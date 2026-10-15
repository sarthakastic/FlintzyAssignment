import { useEffect, useId, useRef, useState } from "react"
import { ChevronDown, LayoutList, Search } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import { Input } from "@/components/ui/input"
import type { Platform, PostStatus } from "@/features/posts/postsTypes"
import { platformConfig, supportedPlatforms } from "@/lib/platform"
import { cn } from "@/lib/utils"

type Option = {
  id: string
  label: string
  dotClassName: string
}

const platformDots: Record<Platform, string> = {
  instagram: "bg-[#d62976]",
  facebook: "bg-[#1877f2]",
  x: "bg-[#111111]",
  tiktok: "bg-[#111111]",
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((option) => option.id === value) ?? options[0]

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#eeeaf5] bg-white px-3 text-sm font-medium shadow-[0_8px_18px_-14px_rgba(60,40,100,0.45)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className={cn("size-2 rounded-full", selected.dotClassName)} />
        {selected.label}
        <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 min-w-44 rounded-2xl border border-[#eeeaf5] bg-white p-1.5 shadow-[0_16px_40px_-24px_rgba(40,24,72,0.45)]"
        >
          {options.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === value}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  option.id === value && "bg-accent text-primary",
                )}
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                }}
              >
                <span aria-hidden="true" className={cn("size-2 rounded-full", option.dotClassName)} />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

const viewClassName =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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
  const location = useLocation()
  const listSearch = location.pathname === "/queue" ? location.search : ""

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <PillSelect
          options={platformOptions}
          value={platform ?? "all"}
          label={`Platform: ${platformOptions.find((option) => option.id === (platform ?? "all"))?.label ?? "All Platforms"}`}
          onChange={(id) => onPlatformChange(id === "all" ? null : (id as Platform))}
        />
        <PillSelect
          options={statusOptions}
          value={status ?? "all"}
          label={`Status: ${statusOptions.find((option) => option.id === (status ?? "all"))?.label ?? "All Status"}`}
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
          className="h-10 w-full rounded-full border-[#eeeaf5] bg-white pl-10 shadow-[0_8px_18px_-14px_rgba(60,40,100,0.45)]"
        />
      </div>
      <div className="inline-flex w-fit items-center rounded-full border border-[#eeeaf5] bg-white p-1 shadow-[0_8px_18px_-14px_rgba(60,40,100,0.35)]">
        <NavLink
          to={{ pathname: "/queue", search: listSearch }}
          end
          className={({ isActive }) =>
            cn(viewClassName, isActive ? "bg-accent text-primary" : "text-muted-foreground")
          }
        >
          <LayoutList aria-hidden="true" className="size-3.5" />
          List
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            cn(viewClassName, isActive ? "bg-accent text-primary" : "text-muted-foreground")
          }
        >
          Calendar
        </NavLink>
      </div>
    </div>
  )
}
