import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Auth/authSlice';
import postsReducer from './Posts/postsSlice';
import profileReducer from './Profile/profileSlice';
import searchReducer from './Search/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    search: searchReducer,
  },
});