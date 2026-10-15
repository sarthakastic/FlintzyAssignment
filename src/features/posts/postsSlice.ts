import { createSlice } from "@reduxjs/toolkit"
import type { Post } from "@/features/posts/postsTypes"
import { createPost, fetchPosts } from "@/features/posts/postsThunks"

export interface PostsState {
  items: Post[]
  loading: boolean
  initialized: boolean
  error: string | null
  creating: boolean
  createError: string | null
  retryingIds: string[]
}

const initialState: PostsState = {
  items: [],
  loading: false,
  initialized: false,
  error: null,
  creating: false,
  createError: null,
  retryingIds: [],
}

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.initialized = true
        state.error = null
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        if (action.meta.condition) {
          return
        }

        state.loading = false
        state.error = action.payload ?? "Unable to load posts. Please try again."
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true
        state.createError = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false
        state.createError = null

        if (!state.items.some((post) => post.id === action.payload.id)) {
          state.items.push(action.payload)
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false
        state.createError = action.payload ?? "Unable to create the post. Please retry."
      })
  },
})

export const postsReducer = postsSlice.reducer
