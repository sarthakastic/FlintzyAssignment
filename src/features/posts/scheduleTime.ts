const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function defaultScheduleLocalValue(now = new Date()) {
  const next = new Date(now.getTime() + 60 * 60 * 1000)
  next.setSeconds(0, 0)

  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`
}

function parseLocalDateTime(value: string) {
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

export function minimumScheduleLocalValue(now = new Date()) {
  const next = new Date(now)
  next.setSeconds(0, 0)
  next.setMinutes(next.getMinutes() + 1)

  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`
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
