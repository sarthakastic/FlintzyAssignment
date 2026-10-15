import type { ReactNode } from "react"
import { Crown, Moon, Plus, Zap } from "lucide-react"
import { NavLink } from "react-router"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/app/hooks"
import {
  selectFailedCount,
  selectPublishedCount,
  selectTotalPostsCount,
} from "@/features/posts/postsSelectors"
import { cn } from "@/lib/utils"
import {
  primaryNavigation,
  settingsNavigation,
  type NavItem,
} from "@/lib/navigation"

const composerReason = "The post composer will be added in a later milestone."

type SidebarProps = {
  onNavigate?: () => void
  responsiveLabels?: boolean
  headerAction?: ReactNode
  className?: string
}

function countFor(
  label: string,
  counts: { queue: number; published: number; failed: number },
) {
  if (label === "Queue") {
    return counts.queue
  }

  if (label === "Published") {
    return counts.published
  }

  if (label === "Failed") {
    return counts.failed
  }

  return 0
}

function SidebarLink({
  item,
  counts,
  responsiveLabels,
  onNavigate,
}: {
  item: NavItem
  counts: { queue: number; published: number; failed: number }
  responsiveLabels?: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const count = countFor(item.label, counts)

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={responsiveLabels ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#5d6178] transition-colors hover:bg-[#f7f5fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          responsiveLabels && "md:justify-center md:px-0 lg:justify-start lg:px-3",
          isActive && "bg-[#f3eefe] text-primary hover:bg-[#f3eefe]",
        )
      }
    >
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      <span className={cn("flex-1", responsiveLabels && "md:sr-only lg:not-sr-only")}>
        {item.label}
      </span>
      {count > 0 ? (
        <span
          className={cn(
            "inline-flex min-w-6 items-center justify-center rounded-full bg-[#eceaf3] px-1.5 text-xs font-semibold text-[#4b5168]",
            responsiveLabels && "md:sr-only lg:not-sr-only",
          )}
        >
          {count}
        </span>
      ) : null}
    </NavLink>
  )
}

export function Sidebar({
  onNavigate,
  responsiveLabels = false,
  headerAction,
  className,
}: SidebarProps) {
  const SettingsIcon = settingsNavigation.icon
  const counts = {
    queue: useAppSelector(selectTotalPostsCount),
    published: useAppSelector(selectPublishedCount),
    failed: useAppSelector(selectFailedCount),
  }

  return (
    <div className={cn("flex h-full flex-col bg-white px-3.5 py-5", className)}>
      <div
        className={cn(
          "flex items-center gap-2.5 px-2",
          responsiveLabels && "md:justify-center md:px-0 lg:justify-start lg:px-2",
        )}
      >
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-[#f3eefe] text-primary">
          <Zap aria-hidden="true" className="size-4 fill-current" />
        </span>
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            responsiveLabels && "md:sr-only lg:not-sr-only",
          )}
        >
          Flintzy
        </span>
        {headerAction ? <div className="ml-auto">{headerAction}</div> : null}
      </div>
      <div className="mx-2 mt-4 border-t border-sidebar-border" />

      <nav aria-label="Primary" className="mt-4 flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {primaryNavigation.map((item) => (
            <li key={item.to}>
              <SidebarLink
                item={item}
                counts={counts}
                responsiveLabels={responsiveLabels}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <div
              className={cn(
              "mb-4 rounded-2xl bg-[linear-gradient(180deg,#fff7ef_0%,#f4edff_100%)] p-4",
              responsiveLabels && "md:hidden lg:block",
            )}
          >
            <Crown aria-hidden="true" className="size-4 text-amber-500" />
            <p className="mt-3 text-sm leading-5 font-semibold">
              Plan. Schedule.
              <br />
              Grow Faster.
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Manage all your social content in one place.
            </p>
            <span title={composerReason} className="mt-4 block">
              <Button
                type="button"
                disabled
                aria-label={`Create Post. ${composerReason}`}
                className="h-10 w-full rounded-full bg-primary px-3 text-primary-foreground hover:bg-[#6d28d9] disabled:opacity-100"
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Create Post
              </Button>
            </span>
          </div>

          <div className={cn("flex items-center gap-1", responsiveLabels && "md:flex-col lg:flex-row")}>
            <NavLink
              to={settingsNavigation.to}
              title={responsiveLabels ? settingsNavigation.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#5d6178] hover:bg-[#f7f5fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  responsiveLabels && "md:justify-center md:px-0 lg:justify-start lg:px-3",
                  isActive && "bg-[#f3eefe] text-primary",
                )
              }
            >
              <SettingsIcon aria-hidden="true" className="size-[18px]" />
              <span className={cn(responsiveLabels && "md:sr-only lg:not-sr-only")}>
                {settingsNavigation.label}
              </span>
            </NavLink>
            <button
              type="button"
              aria-label="Appearance. Theme switching is not available yet."
              title="Theme switching is not available yet."
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Moon aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
