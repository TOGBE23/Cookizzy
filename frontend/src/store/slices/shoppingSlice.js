import { createSlice } from '@reduxjs/toolkit';

// Fonction pour charger l'état depuis localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('shoppingList');
    if (serializedState === null) {
      return {
        selectedRecipes: [],
        shoppingList: [],
        checkedItems: {},
        recipesData: []
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Erreur chargement localStorage:', err);
    return {
      selectedRecipes: [],
      shoppingList: [],
      checkedItems: {},
      recipesData: []
    };
  }
};

// Fonction pour sauvegarder l'état dans localStorage
const saveState = (state) => {
  try {
    const stateToSave = {
      selectedRecipes: state.selectedRecipes,
      shoppingList: state.shoppingList,
      checkedItems: state.checkedItems,
      recipesData: state.recipesData
    };
    localStorage.setItem('shoppingList', JSON.stringify(stateToSave));
  } catch (err) {
    console.error('Erreur sauvegarde localStorage:', err);
  }
};

const initialState = loadState();

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    // Ajouter une recette à la sélection
    addRecipeToSelection: (state, action) => {
      if (!state.selectedRecipes.includes(action.payload)) {
        state.selectedRecipes.push(action.payload);
        saveState(state);
      }
    },
    
    // Retirer une recette de la sélection
    removeRecipeFromSelection: (state, action) => {
      state.selectedRecipes = state.selectedRecipes.filter(id => id !== action.payload);
      state.recipesData = state.recipesData.filter(recipe => recipe.id !== action.payload);
      saveState(state);
    },
    
    // Ajouter les données complètes d'une recette
    addRecipeData: (state, action) => {
      if (!state.recipesData.find(r => r.id === action.payload.id)) {
        state.recipesData.push(action.payload);
        saveState(state);
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
                const qty1 = parseFloat(existing.quantity) || 0;
                const qty2 = parseFloat(ing.quantity) || 0;
                existing.quantity = (qty1 + qty2).toString();
              } else {
                ingredientsMap.set(key, { 
                  name: ing.name, 
                  quantity: ing.quantity || '', 
                  unit: ing.unit || '',
                  recipe: recipe.title
                });
              }
            }
          });
        }
      });
      
      state.shoppingList = Array.from(ingredientsMap.values());
      saveState(state);
    },
    
    // Cocher/décocher un ingrédient
    toggleCheckedItem: (state, action) => {
      const index = action.payload;
      state.checkedItems[index] = !state.checkedItems[index];
      saveState(state);
    },
    
    // Tout cocher/décocher
    toggleAllItems: (state, action) => {
      const checked = action.payload;
      state.shoppingList.forEach((_, index) => {
        state.checkedItems[index] = checked;
      });
      saveState(state);
    },
    
    // Réinitialiser la liste
    clearShoppingList: (state) => {
      state.selectedRecipes = [];
      state.shoppingList = [];
      state.checkedItems = {};
      state.recipesData = [];
      localStorage.removeItem('shoppingList');
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