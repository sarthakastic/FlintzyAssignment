import { createAsyncThunk } from "@reduxjs/toolkit"
import type { CreatePostInput, Post } from "@/features/posts/postsTypes"
import { toErrorMessage } from "@/lib/errors"
import { mockPostsApi } from "@/services/mockPostsApi"

type PostsThunkState = {
  posts: {
    loading: boolean
    initialized: boolean
  }
}

export const fetchPosts = createAsyncThunk<
  Post[],
  { reload?: boolean } | void,
  { rejectValue: string; state: PostsThunkState }
>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      return await mockPostsApi.getPosts()
    } catch (error) {
      return rejectWithValue(
        toErrorMessage(error, "Unable to load posts. Please try again."),
      )
    }
  },
  {
    condition: (arg, { getState }) => {
      const { posts } = getState()

      if (posts.loading) {
        return false
      }

      if (typeof arg === "object" && arg?.reload) {
        return true
      }

      return !posts.initialized
    },
  },
)

export const createPost = createAsyncThunk<
  Post,
  CreatePostInput,
  { rejectValue: string }
>("posts/createPost", async (input, { rejectWithValue }) => {
  try {
    return await mockPostsApi.createPost(input)
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to create the post. Please retry."),
    )
  }
})
