import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Récupérer toutes les recettes
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/recipes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// Récupérer une recette par ID
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// Ajouter une recette
export const addRecipe = createAsyncThunk(
  'recipes/add',
  async (recipeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/recipes', recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur addRecipe:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// Mettre à jour une recette
export const updateRecipe = createAsyncThunk(
  'recipes/update',
  async ({ id, recipeData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/recipes/${id}`, recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur update:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// Supprimer une recette
export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/recipes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

// Récupérer les recettes d'un utilisateur
export const fetchUserRecipes = createAsyncThunk(
  'recipes/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/recipes/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur serveur' });
    }
  }
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    currentRecipe: null,
    userRecipes: [],
    isLoading: false,
    error: null,
    success: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors du chargement';
      })
      
      // Fetch recipe by ID
      .addCase(fetchRecipeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors du chargement';
      })
      
      // Add recipe
      .addCase(addRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes.push(action.payload);
        state.success = true;
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors de l\'ajout';
      })
      
      // Update recipe
      .addCase(updateRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;
        state.success = true;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors de la mise à jour';
      })
      
      // Delete recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = state.recipes.filter(r => r.id !== action.payload);
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors de la suppression';
      })
      
      // Fetch user recipes
      .addCase(fetchUserRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRecipes = action.payload;
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Erreur lors du chargement';
      });
  }
});

export const { clearError, clearSuccess, clearCurrentRecipe } = recipeSlice.actions;
export default recipeSlice.reducer;