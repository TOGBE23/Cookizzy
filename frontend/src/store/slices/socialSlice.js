import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ==================== LIKES ====================
export const toggleLike = createAsyncThunk(
  'social/toggleLike',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/social/recipes/${recipeId}/like`);
      return { recipeId, liked: response.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

export const checkLike = createAsyncThunk(
  'social/checkLike',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/social/recipes/${recipeId}/like/check`);
      return { recipeId, liked: response.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// ==================== COMMENTAIRES ====================
export const fetchComments = createAsyncThunk(
  'social/fetchComments',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/social/recipes/${recipeId}/comments`);
      return { recipeId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ recipeId, content, rating }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/social/recipes/${recipeId}/comments`, { content, rating });
      return { recipeId, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

export const deleteComment = createAsyncThunk(
  'social/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/social/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

export const fetchRating = createAsyncThunk(
  'social/fetchRating',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/social/recipes/${recipeId}/rating`);
      return { recipeId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState: {
    likes: {}, // { recipeId: boolean }
    comments: {}, // { recipeId: [commentaires] }
    ratings: {}, // { recipeId: { average, total } }
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== LIKES =====
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { recipeId, liked } = action.payload;
        state.likes[recipeId] = liked;
      })
      .addCase(checkLike.fulfilled, (state, action) => {
        const { recipeId, liked } = action.payload;
        state.likes[recipeId] = liked;
      })
      
      // ===== COMMENTAIRES =====
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { recipeId, comments } = action.payload;
        state.comments[recipeId] = comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { recipeId, comment } = action.payload;
        if (!state.comments[recipeId]) {
          state.comments[recipeId] = [];
        }
        state.comments[recipeId] = [comment, ...state.comments[recipeId]];
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        // Supprimer le commentaire de tous les recipes où il apparaît
        Object.keys(state.comments).forEach(recipeId => {
          state.comments[recipeId] = state.comments[recipeId].filter(c => c.id !== commentId);
        });
      })
      
      // ===== RATINGS =====
      .addCase(fetchRating.fulfilled, (state, action) => {
        const { recipeId, average, total } = action.payload;
        state.ratings[recipeId] = { average, total };
      })
      
      // Gestion des erreurs
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload?.message || 'Une erreur est survenue';
        }
      );
  }
});

export const { clearError } = socialSlice.actions;
export default socialSlice.reducer;