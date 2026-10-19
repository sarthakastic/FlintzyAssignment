import type { Platform, Post, PostStatus } from "@/features/posts/postsTypes"

export const POSTS_STORAGE_KEY = "flintzy.posts.v1"

const platforms = new Set<Platform>(["facebook", "instagram", "x", "tiktok"])
const statuses = new Set<PostStatus>(["scheduled", "published", "failed"])

const utcTimestamp =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StorageError"
  }
}

function storageUnavailable() {
  return new StorageError("Browser storage is unavailable.")
}

function invalidStoredPosts() {
  return new StorageError("Stored post data is invalid.")
}

function saveFailed() {
  return new StorageError("Unable to save changes to browser storage.")
}

function getLocalStorage() {
  try {
    if (typeof localStorage === "undefined") {
      throw storageUnavailable()
    }

    return localStorage
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }

    throw storageUnavailable()
  }
}

function isUtcTimestamp(value: string) {
  if (!utcTimestamp.test(value)) {
    return false
  }

  return !Number.isNaN(Date.parse(value))
}

function readPlatforms(value: unknown): Platform[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const next: Platform[] = []

  for (const platform of value) {
    if (typeof platform !== "string" || !platforms.has(platform as Platform)) {
      return null
    }

    if (next.includes(platform as Platform)) {
      return null
    }

    next.push(platform as Platform)
  }

  return next
}

function toPost(value: unknown): Post | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const postPlatforms = readPlatforms(record.platforms)

  if (typeof record.id !== "string" || record.id.trim() === "") {
    return null
  }

  if (typeof record.content !== "string" || record.content.trim() === "") {
    return null
  }

  if (!postPlatforms) {
    return null
  }

  if (typeof record.scheduledAt !== "string" || !isUtcTimestamp(record.scheduledAt)) {
    return null
  }

  if (typeof record.status !== "string" || !statuses.has(record.status as PostStatus)) {
    return null
  }

  if (record.mediaUrl !== undefined && typeof record.mediaUrl !== "string") {
    return null
  }

  if (record.errorMessage !== undefined && typeof record.errorMessage !== "string") {
    return null
  }

  if (
    record.status === "failed" &&
    (typeof record.errorMessage !== "string" || record.errorMessage.trim() === "")
  ) {
    return null
  }

  const post: Post = {
    id: record.id,
    content: record.content,
    platforms: postPlatforms,
    scheduledAt: record.scheduledAt,
    status: record.status as PostStatus,
  }

  if (typeof record.mediaUrl === "string" && record.mediaUrl.trim()) {
    post.mediaUrl = record.mediaUrl
  }

  if (typeof record.errorMessage === "string" && record.errorMessage.trim()) {
    post.errorMessage = record.errorMessage
  }

  return post
}

function parsePosts(raw: string): Post[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw invalidStoredPosts()
  }

  if (!Array.isArray(parsed)) {
    throw invalidStoredPosts()
  }

  const posts: Post[] = []
  const ids = new Set<string>()

  for (const entry of parsed) {
    const post = toPost(entry)

    if (!post || ids.has(post.id)) {
      throw invalidStoredPosts()
    }

    ids.add(post.id)
    posts.push(post)
  }

  return posts
}

function copyPosts(posts: Post[]): Post[] {
  return posts.map((post) => ({
    ...post,
    platforms: [...post.platforms],
  }))
}

export const storageService = {
  getPosts(): Post[] | null {
    const storage = getLocalStorage()
    let raw: string | null

    try {
      raw = storage.getItem(POSTS_STORAGE_KEY)
    } catch {
      throw storageUnavailable()
    }

    if (raw === null) {
      return null
    }

    return copyPosts(parsePosts(raw))
  },

  savePosts(posts: Post[]) {
    const storage = getLocalStorage()
    const serialised = JSON.stringify(parsePosts(JSON.stringify(posts)))

    try {
      storage.setItem(POSTS_STORAGE_KEY, serialised)
    } catch {
      throw saveFailed()
    }
  },
}
