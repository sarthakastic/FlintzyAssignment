import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

type PostQueueNoResultsProps = {
  onClear: () => void
}

export function PostQueueNoResults({ onClear }: PostQueueNoResultsProps) {
  return (
    <div className="soft-card px-6 py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#f3eefe] text-primary">
        <SearchX aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">No posts found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Try changing your search or adjusting your filters.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 rounded-full"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </div>
  )
}
