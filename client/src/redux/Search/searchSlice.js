import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/tokenHandler';

// Search users
export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`https://myprofiledashboardserver.vercel.app/api/search/users?q=${encodeURIComponent(query)}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to search users');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Search posts
export const searchPosts = createAsyncThunk(
  'search/searchPosts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`https://myprofiledashboardserver.vercel.app/api/search/posts?q=${encodeURIComponent(query)}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to search posts');
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    activeTab: 'users',
    users: [],
    posts: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      // Clear results when switching tabs
      if (action.payload === 'users') {
        state.posts = [];
      } else {
        state.users = [];
      }
    },
    clearResults: (state) => {
      state.users = [];
      state.posts = [];
      state.query = '';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Search Users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search Posts
      .addCase(searchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.error = null;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setQuery, setActiveTab, clearResults, clearError } = searchSlice.actions;
export default searchSlice.reducer;