import { store } from '../redux/store';
import { logout } from '../redux/Auth/authSlice';

// Check if JWT token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decode JWT token (without verification, just to check expiration)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, consider it expired
  }
};

// Handle token expiration - clear storage and redirect to login
export const handleTokenExpiration = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Dispatch logout action to clear Redux state
  store.dispatch(logout());
  
  // Redirect to login
  window.location.href = '/';
};

// Check token and handle expiration
export const checkTokenAndHandleExpiration = () => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    handleTokenExpiration();
    return false;
  }
  
  return true;
};

// Enhanced fetch with token expiration handling
export const fetchWithAuth = async (url, options = {}) => {
  // Check token before making request
  if (!checkTokenAndHandleExpiration()) {
    throw new Error('Token expired. Please login again.');
  }

  const token = localStorage.getItem('token');
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle unauthorized/expired token responses
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Token expired. Please login again.');
    }

    return response;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.message.includes('Token expired')) {
      throw error;
    }
    console.error('API call error:', error);
    throw error;
  }
};