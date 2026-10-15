import { CalendarDays } from "lucide-react"

export function IdeaCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#f3eefe_0%,#fde8f3_100%)] p-4">
      <h2 className="max-w-[180px] text-sm font-semibold leading-5 text-foreground">
        Turn your ideas into impactful content
      </h2>
      <p className="mt-1.5 max-w-[190px] text-xs leading-5 text-muted-foreground">
        Create, schedule and manage your social media posts effortlessly.
      </p>
      <CalendarDays
        aria-hidden="true"
        className="absolute right-3 bottom-3 size-10 text-primary/70"
      />
    </section>
  )
}
