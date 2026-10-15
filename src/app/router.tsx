import { Route, Routes } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { PlaceholderPage } from "@/components/PlaceholderPage"
import { QueuePage } from "@/features/queue/QueuePage"

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<QueuePage />} />
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
