import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchUserRecipes, deleteRecipe } from '../store/slices/recipeSlice';
import { addRecipeToSelection } from '../store/slices/shoppingSlice';
import Modal from '../components/Modal';
import AddRecipeForm from '../components/AddRecipeForm';
import EditRecipeForm from '../components/EditRecipeForm';
import ViewRecipeModal from '../components/ViewRecipeModal';
import ConfirmModal from '../components/ConfirmModal';

const MyRecipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { userRecipes, isLoading } = useSelector((state) => state.recipes);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [showAddToListConfirm, setShowAddToListConfirm] = useState(false);
  const [recipeToAdd, setRecipeToAdd] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserRecipes(user.id));
    }
  }, [dispatch, user]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 dark:border-primary-800 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-gray-300">Chargement de vos recettes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-white">
              Mes recettes <span className="text-sm font-normal ml-2 text-neutral-600 dark:text-gray-300">({userRecipes.length})</span>
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto bg-primary-main dark:bg-primary-dark text-blue px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <span>+</span> Ajouter une recette
            </motion.button>
          </div>
        </motion.div>

        {userRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-12 text-center"
          >
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Vous n'avez pas encore de recettes
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-main dark:bg-primary-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Créer ma première recette
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {userRecipes.map((recipe) => {
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
      </div>

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une nouvelle recette"
        size="max-w-4xl"
      >
        <AddRecipeForm 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            if (user) {
              dispatch(fetchUserRecipes(user.id));
            }
            toast.success('Recette ajoutée avec succès !', {
              position: 'bottom-center',
              id: 'add-success'
            });
          }}
        />
      </Modal>

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
            if (user) {
              dispatch(fetchUserRecipes(user.id));
            }
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

export default MyRecipes;