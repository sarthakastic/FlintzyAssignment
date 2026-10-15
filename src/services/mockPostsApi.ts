import type { CreatePostInput, Platform, Post } from "@/features/posts/postsTypes"
import { supportedPlatforms } from "@/lib/platform"
import { mockPosts } from "@/services/mockData"
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

function readPersistedPosts() {
  const stored = storageService.getPosts()

  if (stored !== null) {
    return stored
  }

  const seeded = copyPosts(mockPosts)
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
      content: input.content.trim(),
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
      throw new Error("Post not found.")
    }

    if (existing.status !== "failed") {
      throw new Error("Only failed posts can be retried.")
    }

    await delay(retryDelayMs)

    if (didRetryFail()) {
      throw new Error("Temporary publishing error. Please retry.")
    }

    const latest = readPersistedPosts()
    const current = latest.find((post) => post.id === id)

    if (!current) {
      throw new Error("Post not found.")
    }

    if (current.status !== "failed") {
      throw new Error("Only failed posts can be retried.")
    }

    const updated: Post = {
      ...current,
      platforms: [...current.platforms],
      status: "scheduled",
    }

    delete updated.errorMessage

    storageService.savePosts(
      latest.map((post) => (post.id === id ? updated : post)),
    )

    return copyPost(updated)
  },
}
