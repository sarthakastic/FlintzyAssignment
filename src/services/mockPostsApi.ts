import type { CreatePostInput, Platform, Post } from "@/features/posts/postsTypes"
import { characterLimitMessage, platformsOverLimit } from "@/features/posts/postValidation"
import { isHttpUrl } from "@/features/posts/scheduleTime"
import { isDue, retryOutcomeStatus } from "@/features/posts/postsUtils"
import { supportedPlatforms } from "@/lib/platform"
import { createMockPosts } from "@/services/mockData"
import { delay } from "@/services/delay"
import { storageService } from "@/services/storageService"

const supported = new Set<Platform>(supportedPlatforms)
const requestDelayMs = 500
const retryDelayMs = 1000

const timestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/

function copyPost(post: Post): Post {
  return {
    ...post,
    platforms: [...post.platforms],
  }
}

function copyPosts(posts: Post[]) {
  return posts.map(copyPost)
}

// Simulates the publishing worker: scheduled posts whose time has passed are
// treated as published. Returns the posts that changed and persists them.
function publishDue(posts: Post[], now = Date.now()) {
  const published: Post[] = []
  const next = posts.map((post) => {
    if (post.status !== "scheduled" || !isDue(post, now)) {
      return post
    }

    const updated: Post = { ...post, platforms: [...post.platforms], status: "published" }
    published.push(updated)
    return updated
  })

  if (published.length > 0) {
    storageService.savePosts(next)
  }

  return { posts: next, published }
}

function readPersistedPosts() {
  const stored = storageService.getPosts()

  if (stored !== null) {
    return publishDue(stored).posts
  }

  const seeded = createMockPosts()
  storageService.savePosts(seeded)
  return copyPosts(seeded)
}

function assertCreateInput(input: CreatePostInput) {
  if (input.content.trim() === "") {
    throw new Error("Post content cannot be empty.")
  }

  if (input.platforms.length === 0) {
    throw new Error("Select at least one platform.")
  }

  const platforms: Platform[] = []

  for (const platform of input.platforms) {
    if (!supported.has(platform)) {
      throw new Error("One or more platforms are not supported.")
    }

    if (!platforms.includes(platform)) {
      platforms.push(platform)
    }
  }

  if (!timestampPattern.test(input.scheduledAt) || Number.isNaN(Date.parse(input.scheduledAt))) {
    throw new Error("The scheduled timestamp must be a valid UTC date.")
  }

  if (Date.parse(input.scheduledAt) <= Date.now()) {
    throw new Error("The scheduled time must be in the future.")
  }

  const overLimit = platformsOverLimit(input.content, platforms)
  if (overLimit.length > 0) {
    throw new Error(characterLimitMessage(overLimit))
  }

  const mediaUrl = input.mediaUrl?.trim()
  if (mediaUrl && !isHttpUrl(mediaUrl)) {
    throw new Error("The image URL must be a valid http or https URL.")
  }

  return platforms
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  throw new Error("Unable to create the post. Please retry.")
}

function didRetryFail() {
  return Math.random() < 0.2
}

export const mockPostsApi = {
  async getPosts(): Promise<Post[]> {
    await delay(requestDelayMs)

    try {
      return readPersistedPosts()
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error
      }

      throw new Error("Unable to load posts. Please try again.")
    }
  },

  async createPost(input: CreatePostInput): Promise<Post> {
    assertCreateInput(input)
    await delay(requestDelayMs)
    const platforms = assertCreateInput(input)

    const posts = readPersistedPosts()
    const created: Post = {
      id: createId(),
      content: input.content,
      platforms,
      scheduledAt: input.scheduledAt,
      status: "scheduled",
    }

    if (input.mediaUrl?.trim()) {
      created.mediaUrl = input.mediaUrl.trim()
    }

    storageService.savePosts([...posts, created])
    return copyPost(created)
  },

  async retryPost(id: string): Promise<Post> {
    const posts = readPersistedPosts()
    const existing = posts.find((post) => post.id === id)

    if (!existing) {
      throw new Error("This post is no longer eligible for retry.")
    }

    if (existing.status !== "failed") {
      throw new Error("This post is no longer eligible for retry.")
    }

    await delay(retryDelayMs)

    if (didRetryFail()) {
      throw new Error("Retry failed. Your post is still marked as failed. Please try again.")
    }

    const latest = readPersistedPosts()
    const current = latest.find((post) => post.id === id)

    if (!current) {
      throw new Error("This post is no longer eligible for retry.")
    }

    if (current.status !== "failed") {
      throw new Error("This post is no longer eligible for retry.")
    }

    const updated: Post = {
      ...current,
      platforms: [...current.platforms],
      status: retryOutcomeStatus(current),
    }

    delete updated.errorMessage

    storageService.savePosts(
      latest.map((post) => (post.id === id ? updated : post)),
    )

    return copyPost(updated)
  },

  async publishDuePosts(): Promise<Post[]> {
    const stored = storageService.getPosts()
    return stored === null ? [] : copyPosts(publishDue(stored).published)
  },

  async resetPosts(): Promise<Post[]> {
    await delay(requestDelayMs)
    const seeded = createMockPosts()
    storageService.savePosts(seeded)
    return copyPosts(seeded)
  },
}
