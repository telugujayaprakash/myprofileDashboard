import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/tokenHandler';

// Fetch profile by username (works with or without authentication)
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (username, { rejectWithValue }) => {
    try {
      // Get token if available (but don't require it)
      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${username}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Update profile data
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/users/profile-data`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Follow user
export const followUser = createAsyncThunk(
  'profile/followUser',
  async (username, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/users/${username}/follow`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to follow user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'profile/unfollowUser',
  async (username, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/users/${username}/unfollow`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to unfollow user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    currentProfile: null,
    isOwnProfile: false,
    isLoading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    followLoading: false,
    followError: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.currentProfile = null;
      state.isOwnProfile = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
      state.followError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = {
          ...action.payload,
          // Ensure isFollowing is preserved if it exists in the payload
          isFollowing: action.payload.isFollowing !== undefined ? action.payload.isFollowing : state.currentProfile?.isFollowing || false
        };
        state.isOwnProfile = action.payload.isOwnProfile || false;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update current profile if it's the same user
        if (state.currentProfile && state.isOwnProfile) {
          state.currentProfile.profileData = {
            ...state.currentProfile.profileData,
            ...action.payload.profileData
          };
        }
        // Also update auth user data in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && action.payload.profileData) {
          const updatedUser = {
            ...user,
            ...action.payload.profileData,
            name: action.payload.profileData.name || user.name,
            profession: action.payload.profileData.profession || user.profession,
            status: action.payload.profileData.status || user.status,
            dob: action.payload.profileData.dateOfBirth || user.dob,
            bio: action.payload.profileData.status || user.bio,
            socials: action.payload.profileData.socialMediaLinks?.reduce((acc, link) => {
              acc[link.platform] = link.url;
              return acc;
            }, {}) || user.socials
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        state.updateError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Follow User
      .addCase(followUser.pending, (state) => {
        state.followLoading = true;
        state.followError = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followLoading = false;
        if (state.currentProfile) {
          state.currentProfile.isFollowing = true;
          state.currentProfile.profileData = {
            ...state.currentProfile.profileData,
            followersCount: action.payload.followersCount || state.currentProfile.profileData.followersCount + 1
          };
        }
        state.followError = null;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followLoading = false;
        state.followError = action.payload;
      })

      // Unfollow User
      .addCase(unfollowUser.pending, (state) => {
        state.followLoading = true;
        state.followError = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followLoading = false;
        if (state.currentProfile) {
          state.currentProfile.isFollowing = false;
          state.currentProfile.profileData = {
            ...state.currentProfile.profileData,
            followersCount: Math.max(0, (action.payload.followersCount || state.currentProfile.profileData.followersCount - 1))
          };
        }
        state.followError = null;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followLoading = false;
        state.followError = action.payload;
      });
  },
});

export const { clearProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;