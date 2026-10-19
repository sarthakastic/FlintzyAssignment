import { LayoutList, SquarePen, type LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const primaryNavigation: NavItem[] = [
  { label: "Queue", to: "/queue", icon: LayoutList },
  { label: "Create post", to: "/compose", icon: SquarePen },
]
