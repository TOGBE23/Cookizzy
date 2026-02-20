import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  useEffect(() => {
    if (recipes.length > 0) {
      recipes.forEach(recipe => {
        if (!ratings[recipe.id]) {
          dispatch(fetchRating(recipe.id));
        }
      });
    }
  }, [recipes, dispatch, ratings]);

  useEffect(() => {
    const unique = [];
    const seen = new Set();
    
    recipes.forEach(recipe => {
      if (!seen.has(recipe.id)) {
        seen.add(recipe.id);
        unique.push(recipe);
      }
    });
    
    setUniqueRecipes(unique);
    
    let filtered = [...unique];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(term) ||
        (recipe.description && recipe.description.toLowerCase().includes(term)) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (selectedIngredient) {
      const ingredient = selectedIngredient.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.ingredients && recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(ingredient)
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(recipe => 
        recipe.category && recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    if (maxPrepTime) {
      filtered = filtered.filter(recipe => 
        recipe.prepTime && recipe.prepTime <= parseInt(maxPrepTime)
      );
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, maxPrepTime, selectedIngredient, recipes]);

  const categories = [...new Set(uniqueRecipes.map(r => r.category).filter(Boolean))];
  const difficulties = ['Facile', 'Moyen', 'Difficile'];
  
  const allIngredients = [...new Set(
    uniqueRecipes.flatMap(r => r.ingredients?.map(i => i.name) || [])
  )].filter(Boolean).sort();

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
      toast.success(`"${recipeToDelete.title}" a été supprimé`, {
        position: 'bottom-center',
        duration: 2000,
        id: 'delete-success'
      });
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
      toast.success(`"${recipeToAdd.title}" ajouté à la liste`, {
        position: 'bottom-center',
        duration: 2000,
        id: 'add-to-list-success'
      });
      setRecipeToAdd(null);
    }
  };

  const getRatingDisplay = (recipeId) => {
    const rating = ratings[recipeId];
    if (!rating || rating.total === 0) return null;
    return (
      <div className="flex items-center mt-1">
        <span className="text-yellow-500 mr-1">★</span>
        <span className="text-xs text-neutral-600 dark:text-gray-300">
          {rating.average} ({rating.total} avis)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold mb-6 text-neutral-700 dark:text-white"
        >
          🔍 Rechercher des recettes
        </motion.h1>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Rechercher par titre, description ou tags..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-primary-main dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition"
            >
              {showFilters ? 'Masquer filtres' : 'Filtres avancés'}
            </button>
          </div>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Ingrédient
                    </label>
                    <input
                      type="text"
                      list="ingredients"
                      placeholder="Ex: poulet, tomate..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                      value={selectedIngredient}
                      onChange={(e) => setSelectedIngredient(e.target.value)}
                    />
                    <datalist id="ingredients">
                      {allIngredients.map(ing => (
                        <option key={ing} value={ing} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Catégorie
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Difficulté
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                      <option value="">Toutes les difficultés</option>
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Temps max (minutes)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 30"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                      value={maxPrepTime}
                      onChange={(e) => setMaxPrepTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSelectedDifficulty('');
                      setMaxPrepTime('');
                      setSelectedIngredient('');
                    }}
                    className="px-4 py-2 bg-secondary-100 dark:bg-gray-700 text-neutral-700 dark:text-white rounded-lg hover:opacity-90 transition"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Résultats */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-800 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-gray-300">Chargement des recettes...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between items-center mb-4"
            >
              <p className="text-neutral-600 dark:text-gray-300">
                {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} trouvée{filteredRecipes.length > 1 ? 's' : ''}
              </p>
              {uniqueRecipes.length !== recipes.length && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  ℹ️ {recipes.length - uniqueRecipes.length} doublon(s) éliminé(s)
                </p>
              )}
            </motion.div>

            {filteredRecipes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-12 text-center"
              >
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
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
                  className="px-6 py-3 bg-primary-main dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition"
                >
                  Effacer tous les filtres
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                <AnimatePresence>
                  {filteredRecipes.map((recipe) => {
                    const isOwner = user && parseInt(user.id) === parseInt(recipe.authorId);
                    
                    return (
                      <motion.div
                        key={recipe.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium overflow-hidden cursor-pointer transition-all"
                        onClick={() => handleViewClick(recipe)}
                      >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden">
                          {recipe.imageUrl ? (
                            <img
                              src={`http://localhost:5000${recipe.imageUrl}`}
                              alt={recipe.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                              <span className="text-3xl sm:text-4xl animate-float">🍳</span>
                            </div>
                          )}
                          
                          {/* Badge difficulté */}
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              recipe.difficulty === 'Facile' ? 'bg-green-500' :
                              recipe.difficulty === 'Moyen' ? 'bg-yellow-500' : 'bg-red-500'
                            } text-white`}>
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold text-neutral-700 dark:text-white line-clamp-1 mb-1">
                            {recipe.title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>⏱️ {recipe.prepTime || '?'} min</span>
                            <span>❤️ {recipe.likes || 0}</span>
                          </div>

                          {getRatingDisplay(recipe.id)}

                          {/* Boutons d'action */}
                          <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(recipe);
                              }}
                              className="p-2 bg-primary-100 dark:bg-primary-900 text-neutral-700 dark:text-white rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                              title="Voir"
                            >
                              👁️
                            </motion.button>
                            
                            {isOwner && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(recipe);
                                  }}
                                  className="p-2 bg-secondary-100 dark:bg-gray-700 text-neutral-700 dark:text-white rounded-lg hover:bg-secondary-200 dark:hover:bg-gray-600 transition-colors"
                                  title="Modifier"
                                >
                                  ✏️
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(recipe);
                                  }}
                                  className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                  title="Supprimer"
                                >
                                  🗑️
                                </motion.button>
                              </>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToListClick(recipe);
                              }}
                              className="p-2 text-white rounded-lg hover:opacity-90 transition-colors"
                              style={{ backgroundColor: '#ffb6c1' }}
                              title="Ajouter à la liste"
                            >
                              🛒
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ViewRecipeModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe}
      />

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
            dispatch(fetchRecipes());
            toast.success('Recette modifiée avec succès !', {
              position: 'bottom-center',
              id: 'edit-success'
            });
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setRecipeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="🗑️ Confirmer la suppression"
        message={
          <div className="text-neutral-700 dark:text-gray-200">
            <p className="mb-2">Êtes-vous sûr de vouloir supprimer :</p>
            <p className="font-semibold text-lg">"{recipeToDelete?.title}"</p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">Cette action est irréversible !</p>
          </div>
        }
        confirmText="Oui, supprimer"
        cancelText="Annuler"
      />

      <ConfirmModal
        isOpen={showAddToListConfirm}
        onClose={() => {
          setShowAddToListConfirm(false);
          setRecipeToAdd(null);
        }}
        onConfirm={handleConfirmAddToList}
        title="🛒 Ajouter à la liste de courses"
        message={
          <div className="text-neutral-700 dark:text-gray-200">
            <p className="mb-2">Voulez-vous ajouter à votre liste de courses :</p>
            <p className="font-semibold text-lg">"{recipeToAdd?.title}"</p>
          </div>
        }
        confirmText="Oui, ajouter"
        cancelText="Non"
      />
    </div>
  );
};

export default SearchRecipes;