import { Bell, ChevronDown, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        className="size-10 shrink-0 rounded-xl bg-white md:hidden"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={onMenuOpen}
      >
        <Menu aria-hidden="true" />
      </Button>
      <div className="relative ml-auto w-full max-w-[240px]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search posts and content"
          placeholder="Search posts, content..."
          className="h-10 rounded-full border-[#eeeaf5] bg-white/90 pl-9 text-sm shadow-none"
        />
      </div>
      <button
        type="button"
        aria-label="Notifications. None yet."
        className="inline-flex size-10 items-center justify-center rounded-full border border-[#eeeaf5] bg-white text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Profile menu. Unavailable until a later milestone."
        className="inline-flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3eefe,#fde8f3)] text-xs font-semibold text-primary">
          FZ
        </span>
        <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </button>
    </header>
  )
}
