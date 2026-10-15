export function PostQueueSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true" aria-live="polite">
      {["Today", "Tomorrow"].map((label) => (
        <section key={label}>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="h-4 w-28 rounded-full bg-muted" />
            <div className="h-3 w-14 rounded-full bg-muted" />
          </div>
          <div className="soft-card divide-y divide-border overflow-hidden">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex animate-pulse flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
                <div className="h-16 w-full rounded-xl bg-muted sm:h-[58px] sm:w-20" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-muted" />
                  <div className="h-3 w-2/5 rounded-full bg-muted" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-muted" />
                  <div className="size-7 rounded-full bg-muted" />
                  <div className="h-7 w-20 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <p className="sr-only">Loading posts.</p>
    </div>
  )
}
