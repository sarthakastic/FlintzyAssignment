import { Navigate, Route, Routes, useLocation } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { CalendarPage } from "@/features/calendar/CalendarPage"
import { ComposePage } from "@/features/posts/ComposePage"
import { QueuePage } from "@/features/queue/QueuePage"

function RedirectToQueue({ status }: { status?: "published" | "failed" }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  if (status) {
    params.set("status", status)
  }

  const search = params.toString()
  return <Navigate to={{ pathname: "/queue", search: search ? `?${search}` : "" }} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<RedirectToQueue />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="compose" element={<ComposePage />} />
        <Route path="published" element={<RedirectToQueue status="published" />} />
        <Route path="failed" element={<RedirectToQueue status="failed" />} />
        <Route path="*" element={<RedirectToQueue />} />
      </Route>
    </Routes>
  )
}
