import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';
import shoppingReducer from './slices/shoppingSlice';
import socialReducer from './slices/socialSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    shopping: shoppingReducer,
    social: socialReducer,
    profile: profileReducer
  },
});