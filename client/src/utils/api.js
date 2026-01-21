// API utility functions with authentication handling
import { fetchWithAuth, handleTokenExpiration } from './tokenHandler'

const API_BASE_URL = import.meta.env.VITE_BASE_URL

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetchWithAuth(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Handle unauthorized responses (additional check)
    if (response.status === 401) {
      handleTokenExpiration()
      throw new Error('Please login to continue')
    }

    return response
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Specific API functions
export const authAPI = {
  login: (credentials) => apiCall('/api/users/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  register: (userData) => apiCall('/api/users/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  verifyOTP: (otpData) => apiCall('/api/users/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(otpData)
  })
}

export const postsAPI = {
  create: (postData) => apiCall('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),

  getFeed: () => apiCall('/api/posts/feed'),

  getUserPosts: (username) => apiCall(`/${username}/posts`),

  getPostDetails: (postId) => apiCall(`/api/posts/${postId}`),

  likePost: (postId) => apiCall(`/api/posts/${postId}/like`, {
    method: 'PUT'
  }),

  sharePost: (postId) => apiCall(`/api/posts/${postId}/share`, {
    method: 'PUT'
  }),

  addComment: (postId, comment) => apiCall(`/api/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  }),

  deletePost: (postId) => apiCall(`/api/posts/${postId}`, {
    method: 'DELETE'
  })
}

export const searchAPI = {
  searchUsers: (query) => apiCall(`/api/search/users?q=${encodeURIComponent(query)}`),

  searchPosts: (query) => apiCall(`/api/search/posts?q=${encodeURIComponent(query)}`)
}

export const profileAPI = {
  getProfile: (username) => apiCall(`/${username}`),

  updateProfile: (profileData) => apiCall('/api/users/profile-data', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
}