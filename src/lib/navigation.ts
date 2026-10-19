import { CalendarDays, LayoutList, SquarePen, type LucideIcon } from "lucide-react"

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const primaryNavigation: NavItem[] = [
  { label: "Queue", to: "/queue", icon: LayoutList },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Create post", to: "/compose", icon: SquarePen },
]
