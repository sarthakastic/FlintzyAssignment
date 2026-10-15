import {
  CalendarDays,
  CircleCheck,
  CircleOff,
  File,
  LayoutList,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const primaryNavigation: NavItem[] = [
  { label: "Queue", to: "/queue", icon: LayoutList, end: true },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Drafts", to: "/drafts", icon: File },
  { label: "Published", to: "/published", icon: CircleCheck },
  { label: "Failed", to: "/failed", icon: CircleOff },
]

export const settingsNavigation: NavItem = {
  label: "Settings",
  to: "/settings",
  icon: Settings,
}

export function getPageLabel(pathname: string): string {
  const match = [...primaryNavigation, settingsNavigation].find(
    (item) => item.to === pathname,
  )

  return match?.label ?? "Scheduler"
}
