import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRecipes, deleteRecipe } from '../store/slices/recipeSlice';
import { fetchRating } from '../store/slices/socialSlice';
import { addRecipeToSelection } from '../store/slices/shoppingSlice';
import ViewRecipeModal from '../components/ViewRecipeModal';
import Modal from '../components/Modal';
import EditRecipeForm from '../components/EditRecipeForm';
import ConfirmModal from '../components/ConfirmModal';

const SearchRecipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recipes, isLoading } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.auth);
  const { ratings } = useSelector((state) => state.social);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [uniqueRecipes, setUniqueRecipes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // States pour les modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [showAddToListConfirm, setShowAddToListConfirm] = useState(false);
  const [recipeToAdd, setRecipeToAdd] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Charger toutes les recettes et leurs notes
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  // Charger les notes pour chaque recette
  useEffect(() => {
    if (recipes.length > 0) {
      recipes.forEach(recipe => {
        if (!ratings[recipe.id]) {
          dispatch(fetchRating(recipe.id));
        }
      });
    }
  }, [recipes, dispatch, ratings]);

  // Fonction pour afficher un message de succès temporaire
  const showTemporaryMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Éliminer les doublons et filtrer
  useEffect(() => {
    // Étape 1: Éliminer les doublons par ID
    const unique = [];
    const seen = new Set();
    
    recipes.forEach(recipe => {
      if (!seen.has(recipe.id)) {
        seen.add(recipe.id);
        unique.push(recipe);
      }
    });
    
    setUniqueRecipes(unique);
    
    // Étape 2: Appliquer les filtres
    let filtered = [...unique];

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(term) ||
        (recipe.description && recipe.description.toLowerCase().includes(term)) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Filtre par ingrédient
    if (selectedIngredient) {
      const ingredient = selectedIngredient.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.ingredients && recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(ingredient)
        )
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(recipe => 
        recipe.category && recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtre par difficulté
    if (selectedDifficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Filtre par temps maximum
    if (maxPrepTime) {
      filtered = filtered.filter(recipe => 
        recipe.prepTime && recipe.prepTime <= parseInt(maxPrepTime)
      );
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, maxPrepTime, selectedIngredient, recipes]);

  // Handlers pour les actions
  const handleViewClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      dispatch(deleteRecipe(recipeToDelete.id));
      showTemporaryMessage(`"${recipeToDelete.title}" a été supprimé`);
      setRecipeToDelete(null);
    }
  };

  const handleAddToListClick = (recipe) => {
    setRecipeToAdd(recipe);
    setShowAddToListConfirm(true);
  };

  const handleConfirmAddToList = () => {
    if (recipeToAdd) {
      dispatch(addRecipeToSelection(recipeToAdd.id));
      showTemporaryMessage(`"${recipeToAdd.title}" ajouté à la liste de courses`);
      setRecipeToAdd(null);
    }
  };

  // Extraire les catégories uniques
  const categories = [...new Set(uniqueRecipes.map(r => r.category).filter(Boolean))];
  const difficulties = ['Facile', 'Moyen', 'Difficile'];
  
  // Extraire tous les ingrédients uniques pour l'autocomplete
  const allIngredients = [...new Set(
    uniqueRecipes.flatMap(r => r.ingredients?.map(i => i.name) || [])
  )].filter(Boolean).sort();

  const getRatingDisplay = (recipeId) => {
    const rating = ratings[recipeId];
    if (!rating || rating.total === 0) return null;
    return (
      <div className="flex items-center mt-1">
        <span className="text-yellow-500 mr-1">★</span>
        <span className="text-sm font-medium" style={{color: '#8b5a2b'}}>
          {rating.average} ({rating.total} avis)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Message de succès flottant */}
        {showSuccessMessage && (
          <div className="fixed top-20 right-4 z-50 animate-slideIn">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <span>✅</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8" style={{color: '#8b5a2b'}}>
          🔍 Rechercher des recettes
        </h1>

        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rechercher par titre, description ou tags..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{focusRingColor: '#ffb6c1'}}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 rounded-md text-white hover:opacity-80 transition"
              style={{backgroundColor: '#c4a484'}}
            >
              {showFilters ? 'Masquer filtres' : 'Filtres avancés'}
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtre par ingrédient */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#8b5a2b'}}>
                    Ingrédient
                  </label>
                  <input
                    type="text"
                    list="ingredients"
                    placeholder="Ex: poulet, tomate..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                  />
                  <datalist id="ingredients">
                    {allIngredients.map(ing => (
                      <option key={ing} value={ing} />
                    ))}
                  </datalist>
                </div>

                {/* Filtre par catégorie */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#8b5a2b'}}>
                    Catégorie
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par difficulté */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#8b5a2b'}}>
                    Difficulté
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="">Toutes les difficultés</option>
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par temps */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#8b5a2b'}}>
                    Temps max (minutes)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={maxPrepTime}
                    onChange={(e) => setMaxPrepTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Bouton de réinitialisation */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedDifficulty('');
                    setMaxPrepTime('');
                    setSelectedIngredient('');
                  }}
                  className="text-sm px-4 py-2 rounded-md hover:opacity-80 transition"
                  style={{color: '#8b5a2b', backgroundColor: '#ffd8b0'}}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
            <p className="mt-4" style={{color: '#8b5a2b'}}>Chargement des recettes...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg" style={{color: '#8b5a2b'}}>
                {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} trouvée{filteredRecipes.length > 1 ? 's' : ''}
              </p>
              {uniqueRecipes.length !== recipes.length && (
                <p className="text-sm text-orange-600">
                  ℹ️ {recipes.length - uniqueRecipes.length} doublon(s) éliminé(s)
                </p>
              )}
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">
                  Aucune recette ne correspond à vos critères
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedDifficulty('');
                    setMaxPrepTime('');
                    setSelectedIngredient('');
                  }}
                  className="px-6 py-3 rounded-md text-white hover:opacity-80 transition"
                  style={{backgroundColor: '#c4a484'}}
                >
                  Effacer tous les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => {
                  const isOwner = user && parseInt(user.id) === parseInt(recipe.authorId);
                  
                  return (
                    <div 
                      key={recipe.id} 
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      {/* Image cliquable */}
                      <div 
                        className="cursor-pointer overflow-hidden h-48"
                        onClick={() => handleViewClick(recipe)}
                      >
                        {recipe.imageUrl ? (
                          <img 
                            src={`http://localhost:5000${recipe.imageUrl}`} 
                            alt={recipe.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                            <span className="text-4xl">🍳</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        {/* Titre */}
                        <h3 
                          className="text-lg font-semibold cursor-pointer hover:text-indigo-600 transition mb-2"
                          onClick={() => handleViewClick(recipe)}
                          style={{color: '#8b5a2b'}}
                        >
                          {recipe.title}
                        </h3>

                        {/* Métadonnées */}
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span className="mr-3">⏱️ {recipe.prepTime || '?'} min</span>
                          <span className="mr-3">📊 {recipe.difficulty}</span>
                          <span>🍽️ {recipe.category || 'Non catégorisé'}</span>
                        </div>

                        {/* Note moyenne */}
                        {getRatingDisplay(recipe.id)}

                        {/* Description courte */}
                        {recipe.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {recipe.description}
                          </p>
                        )}

                        {/* Tags */}
                        {recipe.tags && recipe.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {recipe.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag} 
                                className="px-2 py-1 text-xs rounded-full"
                                style={{backgroundColor: '#ffd8b0', color: '#8b5a2b'}}
                              >
                                #{tag}
                              </span>
                            ))}
                            {recipe.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{recipe.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          <button
                            onClick={() => handleViewClick(recipe)}
                            className="col-span-1 bg-indigo-600 text-white px-2 py-2 rounded-md hover:bg-indigo-700 transition text-sm"
                            title="Voir les détails"
                          >
                            👁️
                          </button>
                          
                          {isOwner ? (
                            <>
                              <button
                                onClick={() => handleEditClick(recipe)}
                                className="col-span-1 bg-gray-600 text-white px-2 py-2 rounded-md hover:bg-gray-700 transition text-sm"
                                title="Modifier la recette"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteClick(recipe)}
                                className="col-span-1 bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 transition text-sm"
                                title="Supprimer la recette"
                              >
                                🗑️
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="col-span-1"></div>
                              <div className="col-span-1"></div>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleAddToListClick(recipe)}
                            className="col-span-1 text-white px-2 py-2 rounded-md hover:opacity-80 transition text-sm"
                            style={{backgroundColor: '#ffb6c1'}}
                            title="Ajouter à la liste de courses"
                          >
                            🛒
                          </button>
                        </div>

                        {/* Message si ce n'est pas votre recette */}
                        {!isOwner && user && (
                          <p className="text-xs text-center mt-2 text-gray-500">
                            Seul le propriétaire peut modifier/supprimer
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de visualisation de recette */}
      <ViewRecipeModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe}
      />

      {/* Modal d'édition de recette */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        title="Modifier la recette"
        size="max-w-4xl"
      >
        <EditRecipeForm 
          recipe={selectedRecipe}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecipe(null);
          }}
          onSuccess={() => {
            dispatch(fetchRecipes()); // Recharger les recettes
            showTemporaryMessage('Recette modifiée avec succès !');
          }}
        />
      </Modal>

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setRecipeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="🗑️ Confirmer la suppression"
        message={
          <div>
            <p className="mb-2">Êtes-vous sûr de vouloir supprimer :</p>
            <p className="font-semibold text-lg" style={{color: '#8b5a2b'}}>"{recipeToDelete?.title}"</p>
            <p className="mt-2 text-sm text-red-600">Cette action est irréversible !</p>
          </div>
        }
        confirmText="Oui, supprimer"
        cancelText="Annuler"
      />

      {/* Modal de confirmation pour l'ajout à la liste */}
      <ConfirmModal
        isOpen={showAddToListConfirm}
        onClose={() => {
          setShowAddToListConfirm(false);
          setRecipeToAdd(null);
        }}
        onConfirm={handleConfirmAddToList}
        title="🛒 Ajouter à la liste de courses"
        message={
          <div>
            <p className="mb-2">Voulez-vous ajouter à votre liste de courses :</p>
            <p className="font-semibold text-lg" style={{color: '#8b5a2b'}}>"{recipeToAdd?.title}"</p>
          </div>
        }
        confirmText="Oui, ajouter"
        cancelText="Non"
      />

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SearchRecipes;