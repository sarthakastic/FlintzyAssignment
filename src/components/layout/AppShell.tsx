import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Outlet } from "react-router"
import { useAppDispatch } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { fetchPosts, publishDuePosts } from "@/features/posts/postsThunks"
import { POSTS_STORAGE_KEY } from "@/services/storageService"

const publishCheckMs = 30_000

export function AppShell() {
  const dispatch = useAppDispatch()
  const [menuOpen, setMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void dispatch(fetchPosts())
  }, [dispatch])

  // Mock publishing worker: scheduled posts flip to published once their time passes.
  useEffect(() => {
    const timer = window.setInterval(() => {
      void dispatch(publishDuePosts())
    }, publishCheckMs)
    return () => window.clearInterval(timer)
  }, [dispatch])

  // Keep multiple open tabs consistent with the shared localStorage data.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === POSTS_STORAGE_KEY || event.key === null) {
        void dispatch(fetchPosts({ reload: true }))
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [dispatch])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus()

    function focusableItems() {
      return [
        ...(dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ]
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const items = focusableItems()
      if (items.length === 0) {
        return
      }

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [menuOpen])

  return (
    <div className="studio-canvas flex min-h-svh text-foreground">
      <aside className="sidebar-frame sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border bg-sidebar md:flex">
        <Sidebar responsiveLabels className="sidebar-rail w-full" />
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
            className="absolute inset-0 bg-black/50"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={dialogRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col bg-card shadow-xl"
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
