import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedRecipes: [], // IDs des recettes sélectionnées
  shoppingList: [], // Liste de courses générée
  checkedItems: {}, // État des cases à cocher
  recipesData: [] // Données complètes des recettes sélectionnées
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    // Ajouter une recette à la sélection
    addRecipeToSelection: (state, action) => {
      if (!state.selectedRecipes.includes(action.payload)) {
        state.selectedRecipes.push(action.payload);
      }
    },
    
    // Retirer une recette de la sélection
    removeRecipeFromSelection: (state, action) => {
      state.selectedRecipes = state.selectedRecipes.filter(id => id !== action.payload);
      state.recipesData = state.recipesData.filter(recipe => recipe.id !== action.payload);
    },
    
    // Ajouter les données complètes d'une recette
    addRecipeData: (state, action) => {
      if (!state.recipesData.find(r => r.id === action.payload.id)) {
        state.recipesData.push(action.payload);
      }
    },
    
    // Générer la liste de courses à partir des recettes sélectionnées
    generateShoppingList: (state) => {
      const ingredientsMap = new Map();
      
      state.recipesData.forEach(recipe => {
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ing => {
            if (ing.name && ing.name.trim() !== '') {
              const key = `${ing.name.toLowerCase()}|${ing.unit || ''}`;
              
              if (ingredientsMap.has(key)) {
                const existing = ingredientsMap.get(key);
                // Additionner les quantités si c'est des nombres
                const qty1 = parseFloat(existing.quantity) || 0;
                const qty2 = parseFloat(ing.quantity) || 0;
                existing.quantity = (qty1 + qty2).toString();
              } else {
                ingredientsMap.set(key, { 
                  name: ing.name, 
                  quantity: ing.quantity || '', 
                  unit: ing.unit || '',
                  recipe: recipe.title // Pour savoir d'où ça vient
                });
              }
            }
          });
        }
      });
      
      state.shoppingList = Array.from(ingredientsMap.values());
    },
    
    // Cocher/décocher un ingrédient
    toggleCheckedItem: (state, action) => {
      const index = action.payload;
      state.checkedItems[index] = !state.checkedItems[index];
    },
    
    // Tout cocher/décocher
    toggleAllItems: (state, action) => {
      const checked = action.payload;
      state.shoppingList.forEach((_, index) => {
        state.checkedItems[index] = checked;
      });
    },
    
    // Réinitialiser la liste
    clearShoppingList: (state) => {
      state.selectedRecipes = [];
      state.shoppingList = [];
      state.checkedItems = {};
      state.recipesData = [];
    }
  }
});

export const { 
  addRecipeToSelection, 
  removeRecipeFromSelection, 
  addRecipeData,
  generateShoppingList, 
  toggleCheckedItem,
  toggleAllItems,
  clearShoppingList 
} = shoppingSlice.actions;

export default shoppingSlice.reducer;