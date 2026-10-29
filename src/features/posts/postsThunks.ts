import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreatePostInput, Post } from "@/features/posts/postsTypes";
import { toErrorMessage } from "@/lib/errors";
import { mockPostsApi } from "@/services/mockPostsApi";

type PostsThunkState = {
  posts: {
    loading: boolean;
    initialized: boolean;
    retryingIds: string[];
  };
};

export const fetchPosts = createAsyncThunk<
  Post[],
  { reload?: boolean } | void,
  { rejectValue: string; state: PostsThunkState }
>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      return await mockPostsApi.getPosts();
    } catch (error) {
      return rejectWithValue(
        toErrorMessage(error, "Unable to load posts. Please try again.")
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      const { posts } = getState();

      if (posts.loading) {
        return false;
      }

      if (typeof arg === "object" && arg?.reload) {
        return true;
      }

      return !posts.initialized;
    },
  }
);

export const createPost = createAsyncThunk<
  Post,
  CreatePostInput,
  { rejectValue: string }
>("posts/createPost", async (input, { rejectWithValue }) => {
  try {
    return await mockPostsApi.createPost(input);
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to create the post. Please retry.")
    );
  }
});

export const duplicatePost = createAsyncThunk<
  Post,
  string,
  { rejectValue: string }
>("posts/duplicatePost", async (id, { rejectWithValue }) => {
  try {
    return await mockPostsApi.duplicatePost(id);
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to duplicate the post. Please retry.")
    );
  }
});

const retryFallback =
  "Retry failed. Your post is still marked as failed. Please try again.";

export const retryPost = createAsyncThunk<
  Post,
  string,
  { rejectValue: string; state: PostsThunkState }
>(
  "posts/retryPost",
  async (id, { rejectWithValue }) => {
    try {
      return await mockPostsApi.retryPost(id);
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, retryFallback));
    }
  },
  {
    condition: (id, { getState }) => !getState().posts.retryingIds.includes(id),
  }
);

export const publishDuePosts = createAsyncThunk<
  Post[],
  void,
  { state: PostsThunkState }
>("posts/publishDuePosts", () => mockPostsApi.publishDuePosts(), {
  condition: (_, { getState }) => getState().posts.initialized,
});

export const resetPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/resetPosts", async (_, { rejectWithValue }) => {
  try {
    return await mockPostsApi.resetPosts();
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, "Unable to reset the demo data. Please try again.")
    );
  }
});
