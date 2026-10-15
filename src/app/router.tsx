import { Navigate, Route, Routes, useLocation } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { PlaceholderPage } from "@/components/PlaceholderPage"
import { ComposePage } from "@/features/posts/ComposePage"
import { QueuePage } from "@/features/queue/QueuePage"

function RedirectToQueue() {
  const location = useLocation()

  return <Navigate to={{ pathname: "/queue", search: location.search }} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<RedirectToQueue />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="compose" element={<ComposePage />} />
        <Route
          path="calendar"
          element={<PlaceholderPage title="Calendar" />}
        />
        <Route path="drafts" element={<PlaceholderPage title="Drafts" />} />
        <Route
          path="published"
          element={<PlaceholderPage title="Published" />}
        />
        <Route path="failed" element={<PlaceholderPage title="Failed" />} />
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" />}
        />
      </Route>
    </Routes>
  )
}
