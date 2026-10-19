import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

type TopbarProps = {
  menuOpen: boolean
  onMenuOpen: () => void
}

export function Topbar({ menuOpen, onMenuOpen }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-transparent px-4 md:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0 rounded-xl bg-card md:hidden"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={onMenuOpen}
      >
        <Menu aria-hidden="true" />
      </Button>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
