import { CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

type PostQueueErrorStateProps = {
  message: string
  retrying?: boolean
  onRetry: () => void
}

export function PostQueueErrorState({ message, retrying = false, onRetry }: PostQueueErrorStateProps) {
  return (
    <div className="soft-card px-6 py-16 text-center" role="alert">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#fdecec] text-[#e11d48]">
        <CircleAlert aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">Unable to load posts</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      <Button
        type="button"
        className="mt-5 rounded-full bg-primary px-4 text-primary-foreground hover:bg-[#6d28d9]"
        disabled={retrying}
        onClick={onRetry}
      >
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  )
}
