import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Post, PostStatus } from "@/features/posts/postsTypes";
import {
  createPost,
  duplicatePost,
  fetchPosts,
  publishDuePosts,
  resetPosts,
  retryPost,
} from "@/features/posts/postsThunks";
import { retryOutcomeStatus } from "@/features/posts/postsUtils";

type RetrySnapshot = {
  requestId: string;
  status: PostStatus;
  errorMessage?: string;
};

interface PostsState {
  items: Post[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  creating: boolean;
  retryingIds: string[];
  retrySnapshots: Record<string, RetrySnapshot>;
  // Latest retry failure message per post, so concurrent failures do not overwrite each other.
  retryErrors: Record<string, string>;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  initialized: false,
  error: null,
  creating: false,
  retryingIds: [],
  retrySnapshots: {},
  retryErrors: {},
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    dismissRetryError(state, action: PayloadAction<string>) {
      delete state.retryErrors[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        // Keep the optimistic version of posts whose retry is still in flight.
        state.items = action.payload.map(
          (post) =>
            (state.retryingIds.includes(post.id) &&
              state.items.find((item) => item.id === post.id)) ||
            post
        );
        state.loading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        state.loading = false;
        state.error =
          action.payload ?? "Unable to load posts. Please try again.";
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;

        if (!state.items.some((post) => post.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(createPost.rejected, (state) => {
        state.creating = false;
      })
      .addCase(retryPost.pending, (state, action) => {
        const id = action.meta.arg;
        const post = state.items.find((item) => item.id === id);

        if (!state.retryingIds.includes(id)) {
          state.retryingIds.push(id);
        }

        delete state.retryErrors[id];

        if (!post || post.status !== "failed") {
          return;
        }

        state.retrySnapshots[id] = {
          requestId: action.meta.requestId,
          status: post.status,
          errorMessage: post.errorMessage,
        };
        post.status = retryOutcomeStatus(post);
        delete post.errorMessage;
      })
      .addCase(retryPost.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.retryingIds = state.retryingIds.filter((item) => item !== id);
        delete state.retrySnapshots[id];

        const index = state.items.findIndex((item) => item.id === id);
        if (index === -1) {
          state.items.push(action.payload);
        } else {
          state.items[index] = action.payload;
        }
      })
      .addCase(retryPost.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        const id = action.meta.arg;
        const snapshot = state.retrySnapshots[id];

        if (snapshot && snapshot.requestId !== action.meta.requestId) {
          return;
        }

        state.retryingIds = state.retryingIds.filter((item) => item !== id);
        delete state.retrySnapshots[id];

        const post = state.items.find((item) => item.id === id);
        if (post && snapshot) {
          post.status = snapshot.status;
          if (snapshot.errorMessage) {
            post.errorMessage = snapshot.errorMessage;
          } else {
            delete post.errorMessage;
          }
        }

        state.retryErrors[id] =
          action.payload ??
          "Retry failed. Your post is still marked as failed. Please try again.";
      })
      .addCase(publishDuePosts.fulfilled, (state, action) => {
        for (const published of action.payload) {
          if (state.retryingIds.includes(published.id)) {
            continue;
          }

          const index = state.items.findIndex(
            (item) => item.id === published.id
          );
          if (index !== -1) {
            state.items[index] = published;
          }
        }
      })
      .addCase(resetPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
        state.retryErrors = {};
      })
      .addCase(resetPosts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Unable to reset the demo data. Please try again.";
      })
      .addCase(duplicatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicatePost.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      });
  },
});

export const { dismissRetryError } = postsSlice.actions;

export const postsReducer = postsSlice.reducer;
