import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/tokenHandler';

// Async thunks for posts
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth('https://myprofiledashboardserver.vercel.app/api/posts/feed', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to fetch feed posts');
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (username, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`https://myprofiledashboardserver.vercel.app/${username}/posts`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to fetch user posts');
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth('https://myprofiledashboardserver.vercel.app/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`https://myprofiledashboardserver.vercel.app/api/posts/${postId}/like`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to like post');
      }

      const data = await response.json();
      return { postId, likes: data.likes };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`https://myprofiledashboardserver.vercel.app/api/posts/${postId}/share`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to share post');
      }

      const data = await response.json();
      return { postId, shares: data.shares };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    feedPosts: [],
    userPosts: [],
    currentPost: null,
    isLoading: false,
    error: null,
    createLoading: false,
    createError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearUserPosts: (state) => {
      state.userPosts = [];
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Feed Posts
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = action.payload;
        state.error = null;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        // Add new post to feed posts if it exists
        if (state.feedPosts.length > 0) {
          state.feedPosts.unshift(action.payload);
        }
        state.createError = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        // Update likes in feed posts
        const feedPost = state.feedPosts.find(post => post._id === postId);
        if (feedPost) {
          feedPost.likes = likes;
        }
        // Update likes in user posts
        const userPost = state.userPosts.find(post => post._id === postId);
        if (userPost) {
          userPost.likes = likes;
        }
      })

      // Share Post
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, shares } = action.payload;
        // Update shares in feed posts
        const feedPost = state.feedPosts.find(post => post._id === postId);
        if (feedPost) {
          feedPost.shares = shares;
        }
        // Update shares in user posts
        const userPost = state.userPosts.find(post => post._id === postId);
        if (userPost) {
          userPost.shares = shares;
        }
      });
  },
});

export const { clearError, clearUserPosts, setCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;