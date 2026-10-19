import type { ReactNode } from "react"
import { Zap } from "lucide-react"
import { NavLink } from "react-router"
import { useAppSelector } from "@/app/hooks"
import { selectTotalPostsCount } from "@/features/posts/postsSelectors"
import { primaryNavigation } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type SidebarProps = {
  onNavigate?: () => void
  responsiveLabels?: boolean
  headerAction?: ReactNode
  className?: string
}

export function Sidebar({
  onNavigate,
  responsiveLabels = false,
  headerAction,
  className,
}: SidebarProps) {
  const totalPosts = useAppSelector(selectTotalPostsCount)

  return (
    <div className={cn("flex h-full flex-col bg-sidebar px-3.5 py-5", className)}>
      <div
        className={cn(
          "flex items-center gap-2.5 px-2",
          responsiveLabels && "rail-row",
        )}
      >
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-accent text-primary">
          <Zap aria-hidden="true" className="size-4 fill-current" />
        </span>
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            responsiveLabels && "rail-label",
          )}
        >
          Flintzy
        </span>
        {headerAction ? <div className="ml-auto">{headerAction}</div> : null}
      </div>
      <div className="mx-2 mt-4 border-t border-sidebar-border" />

      <nav aria-label="Primary" className="mt-4">
        <ul className="flex flex-col gap-1">
          {primaryNavigation.map((item) => {
            const Icon = item.icon
            const count = item.to === "/queue" ? totalPosts : 0

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  title={responsiveLabels ? item.label : undefined}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      responsiveLabels && "rail-row",
                      isActive && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                  <span className={cn("flex-1", responsiveLabels && "rail-label")}>
                    {item.label}
                  </span>
                  {count > 0 ? (
                    <span
                      className={cn(
                        "inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold text-foreground",
                        responsiveLabels && "rail-label",
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
