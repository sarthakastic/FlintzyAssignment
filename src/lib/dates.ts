// Local-calendar date helpers. All of them work in the browser's time zone.

const dateKeyPattern = /^(\d{4})-(\d{2})-(\d{2})$/

/** Sunday-first short weekday names, shared by every calendar in the app. */
export const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function addMonths(date: Date, months: number) {
  // Clamp the day so e.g. 31 Jan + 1 month lands on the last day of February.
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

/** The given day at a specific local time. */
export function atTime(day: Date, hours: number, minutes: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes)
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

/** Local calendar day as `YYYY-MM-DD` (used for grouping and in `?date=` URLs). */
export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseDateKey(value: string | null) {
  const match = value ? dateKeyPattern.exec(value) : null

  if (!match) {
    return null
  }

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

/** Whole weeks (Sunday first) covering the month that contains `date`. */
export function monthGrid(date: Date) {
  const first = startOfMonth(date)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const start = addDays(first, -first.getDay())
  const end = addDays(last, 6 - last.getDay())
  const days: Date[] = []

  for (let day = start; day <= end; day = addDays(day, 1)) {
    days.push(day)
  }

  return days
}
