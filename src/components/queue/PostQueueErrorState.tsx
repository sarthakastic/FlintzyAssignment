import { CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

type PostQueueErrorStateProps = {
  message: string
  retrying?: boolean
  onRetry: () => void
  /** Offered because unreadable saved data would otherwise fail every retry. */
  onReset: () => void
}

export function PostQueueErrorState({
  message,
  retrying = false,
  onRetry,
  onReset,
}: PostQueueErrorStateProps) {
  return (
    <div className="soft-card px-6 py-16 text-center" role="alert">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-destructive">
        <CircleAlert aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">Unable to load posts</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary-hover"
          disabled={retrying}
          onClick={onRetry}
        >
          {retrying ? "Retrying…" : "Retry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-4"
          disabled={retrying}
          onClick={onReset}
        >
          Reset demo data
        </Button>
      </div>
    </div>
  )
}
