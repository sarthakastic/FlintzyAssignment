import type { Platform } from "@/features/posts/postsTypes"
import { platformConfig, supportedPlatforms } from "@/lib/platform"
import { isFutureLocalDateTime, isHttpUrl, localDateTimeToUtcIso } from "@/features/posts/scheduleTime"

export type ComposerValues = {
  content: string
  platforms: Platform[]
  mediaUrl: string
  scheduledAt: string
}

type ComposerFieldErrors = Partial<Record<keyof ComposerValues, string>>

export function orderedSelectedPlatforms(platforms: Platform[]) {
  return supportedPlatforms.filter((platform) => platforms.includes(platform))
}

export function platformsOverLimit(content: string, platforms: Platform[]) {
  return orderedSelectedPlatforms(platforms).filter(
    (platform) => content.length > platformConfig[platform].characterLimit,
  )
}

export function characterLimitMessage(platforms: Platform[]) {
  const labels = platforms.map((platform) => platformConfig[platform].label)

  if (labels.length === 0) {
    return ""
  }

  if (labels.length === 1) {
    return `Content is too long for ${labels[0]}.`
  }

  if (labels.length === 2) {
    return `Content is too long for ${labels[0]} and ${labels[1]}.`
  }

  return `Content is too long for ${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}.`
}

export function validateComposer(values: ComposerValues, now = new Date()): ComposerFieldErrors {
  const errors: ComposerFieldErrors = {}
  const overLimit = platformsOverLimit(values.content, values.platforms)

  if (values.content.trim() === "") {
    errors.content = "Write something before scheduling."
  } else if (overLimit.length > 0) {
    errors.content = characterLimitMessage(overLimit)
  }

  if (values.platforms.length === 0) {
    errors.platforms = "Select at least one platform."
  }

  if (!localDateTimeToUtcIso(values.scheduledAt)) {
    errors.scheduledAt = "Choose a valid date and time."
  } else if (!isFutureLocalDateTime(values.scheduledAt, now)) {
    errors.scheduledAt = "Choose a time in the future."
  }

  const mediaUrl = values.mediaUrl.trim()
  if (mediaUrl && !isHttpUrl(mediaUrl)) {
    errors.mediaUrl = "Enter an http or https image URL."
  }

  return errors
}
