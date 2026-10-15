import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Outlet } from "react-router"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  return (
    <div className="studio-canvas flex min-h-svh text-foreground">
      <aside className="sticky top-0 hidden h-svh w-[84px] shrink-0 border-r border-sidebar-border bg-white md:flex lg:w-[268px]">
        <Sidebar responsiveLabels className="w-full" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar menuOpen={menuOpen} onMenuOpen={() => setMenuOpen(true)} />
        <main className="min-w-0 flex-1 px-4 pb-8 md:px-6">
          <Outlet />
        </main>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1c1b29]/35"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col bg-white shadow-xl"
          >
            <Sidebar
              onNavigate={() => setMenuOpen(false)}
              headerAction={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                  onClick={() => setMenuOpen(false)}
                >
                  <X aria-hidden="true" />
                </Button>
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
