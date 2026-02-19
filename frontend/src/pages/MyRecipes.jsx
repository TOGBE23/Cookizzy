import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchUserRecipes(user.id));
    }
  }, [dispatch, user]);

  // Fonction pour afficher un message de succès temporaire
  const showTemporaryMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
          <p className="mt-4 text-gray-600">Chargement de vos recettes...</p>
        </div>
      </div>
    );
  }

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

        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{color: '#8b5a2b'}}>
            Mes recettes ({userRecipes.length})
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 transition"
          >
            <span>+</span> Ajouter une recette
          </button>
        </div>

        {/* Liste des recettes */}
        {userRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Vous n'avez pas encore de recettes
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
              Créer ma première recette
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {/* Image de la recette */}
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
                
                <div className="p-6">
                  <h2 
                    className="text-xl font-semibold mb-2 cursor-pointer hover:text-indigo-600 transition"
                    style={{color: '#8b5a2b'}}
                    onClick={() => handleViewClick(recipe)}
                  >
                    {recipe.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description || 'Pas de description'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="mr-4">⏱️ {recipe.prepTime || '?'} min</span>
                    <span className="mr-4">📊 {recipe.difficulty}</span>
                    <span>🍽️ {recipe.category || 'Non catégorisé'}</span>
                  </div>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 rounded-full text-xs"
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
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleViewClick(recipe)}
                      className="col-span-1 bg-indigo-600 text-white px-2 py-2 rounded-md hover:bg-indigo-700 text-sm transition"
                      title="Voir les détails"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleEditClick(recipe)}
                      className="col-span-1 bg-gray-600 text-white px-2 py-2 rounded-md hover:bg-gray-700 text-sm transition"
                      title="Modifier la recette"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(recipe)}
                      className="col-span-1 bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 text-sm transition"
                      title="Supprimer la recette"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handleAddToListClick(recipe)}
                      className="col-span-1 text-white px-2 py-2 rounded-md hover:opacity-80 transition text-sm"
                      style={{backgroundColor: '#ffb6c1'}}
                      title="Ajouter à la liste de courses"
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de recette */}
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
            showTemporaryMessage('Recette ajoutée avec succès !');
          }}
        />
      </Modal>

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
            if (user) {
              dispatch(fetchUserRecipes(user.id));
            }
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

export default MyRecipes;