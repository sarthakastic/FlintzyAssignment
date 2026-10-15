import { CalendarDays } from "lucide-react"

export function PostQueueEmptyState() {
  return (
    <div className="soft-card px-6 py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#f3eefe] text-primary">
        <CalendarDays aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">Your queue is ready</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Your scheduled social media posts will appear here.
      </p>
    </div>
  )
}
