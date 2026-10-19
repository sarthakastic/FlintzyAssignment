const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export const scheduleMinuteStep = 5

/** Formats a Date as a `YYYY-MM-DDTHH:MM` wall-clock value in the local time zone. */
export function toLocalDateTimeValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Rounds up to the next whole step of minutes (always strictly after `date`'s minute). */
export function roundUpToMinuteStep(date: Date, step = scheduleMinuteStep) {
  const next = new Date(date)
  next.setSeconds(0, 0)
  next.setMinutes(Math.floor(next.getMinutes() / step) * step + step)
  return next
}

export function defaultScheduleLocalValue(now = new Date()) {
  return toLocalDateTimeValue(roundUpToMinuteStep(new Date(now.getTime() + 60 * 60 * 1000)))
}

/**
 * Default schedule for a specific day (e.g. picked in the calendar): 9:00 that
 * day, or the usual "an hour from now" when 9:00 has already passed.
 */
export function defaultScheduleForDay(day: Date, now = new Date()) {
  const morning = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0)
  return morning > now ? toLocalDateTimeValue(morning) : defaultScheduleLocalValue(now)
}

export function parseLocalDateTime(value: string) {
  if (!localDateTimePattern.test(value)) {
    return null
  }

  const [datePart, timePart] = value.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) {
    return null
  }

  return date
}

export function localDateTimeToUtcIso(value: string) {
  return parseLocalDateTime(value)?.toISOString() ?? null
}

export function isFutureLocalDateTime(value: string, now = new Date()) {
  const date = parseLocalDateTime(value)
  return date !== null && date.getTime() > now.getTime()
}

export function localTimeZoneName() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export function formatScheduleLabel(value: string) {
  const date = parseLocalDateTime(value)

  if (!date) {
    return "Choose a date and time"
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
