import { CalendarDays, LayoutList } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import { cn } from "@/lib/utils"

const viewClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** Switches between list and calendar while keeping the active filters in the URL. */
export function ViewSwitcher() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  // The selected calendar day only means something in the calendar view.
  params.delete("date")
  const filters = params.toString() ? `?${params.toString()}` : ""

  return (
    <nav
      aria-label="View"
      className="inline-flex w-fit shrink-0 items-center rounded-full border border-border bg-card p-1 control-shadow"
    >
      {[
        { to: "/queue", label: "List", icon: LayoutList, search: filters },
        { to: "/calendar", label: "Calendar", icon: CalendarDays, search: location.pathname === "/calendar" ? location.search : filters },
      ].map(({ to, label, icon: Icon, search }) => (
        <NavLink
          key={to}
          to={{ pathname: to, search }}
          className={({ isActive }) =>
            cn(viewClassName, isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")
          }
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
