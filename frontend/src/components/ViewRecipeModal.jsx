import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { addRecipeToSelection } from '../store/slices/shoppingSlice';
import { fetchRating } from '../store/slices/socialSlice';
import LikeButton from './LikeButton';
import RatingStars from './RatingStars';
import CommentsSection from './CommentsSection';
import ConfirmModal from './ConfirmModal';

const ViewRecipeModal = ({ isOpen, onClose, recipe }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { ratings } = useSelector((state) => state.social);
  
  const [showAddToListConfirm, setShowAddToListConfirm] = useState(false);

  // Charger la note de la recette si pas déjà fait
  useEffect(() => {
    if (recipe && !ratings[recipe.id]) {
      dispatch(fetchRating(recipe.id));
    }
  }, [dispatch, recipe, ratings]);

  if (!isOpen || !recipe) return null;

  const recipeRating = ratings[recipe.id] || { average: 0, total: 0 };
  const isAuthor = user && recipe.authorId === user.id;

  const handleAddToShoppingList = () => {
    dispatch(addRecipeToSelection(recipe.id));
    setShowAddToListConfirm(false);
    toast.success(`"${recipe.title}" ajouté à la liste !`, {
      position: 'bottom-center',
      duration: 2000,
      id: 'add-to-list'
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* En-tête */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-white">
                    {recipe.title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Corps */}
                <div className="p-4 sm:p-6">
                  {/* Image */}
                  {recipe.imageUrl ? (
                    <img 
                      src={`http://localhost:5000${recipe.imageUrl}`} 
                      alt={recipe.title}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg mb-6"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-6 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl animate-float">🍳</span>
                    </div>
                  )}

                  {/* Titre et like */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-white">
                      {recipe.title}
                    </h1>
                    <LikeButton recipeId={recipe.id} initialLikes={recipe.likes || 0} />
                  </div>

                  {/* Note moyenne - DÉJÀ PRÉSENTE */}
                  {recipeRating.total > 0 && (
                    <div className="mb-4">
                      <RatingStars rating={recipeRating.average} total={recipeRating.total} readonly />
                    </div>
                  )}

                  {/* Bouton ajouter à la liste */}
                  <button
                    onClick={() => setShowAddToListConfirm(true)}
                    className="mb-6 px-4 py-2 bg-[#ffb347] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                  >
                    🛒 Ajouter à ma liste de courses
                  </button>

                  {/* Description */}
                  {recipe.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 text-neutral-700 dark:text-white">Description</h3>
                      <p className="text-gray-600 dark:text-gray-300">{recipe.description}</p>
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="flex flex-wrap gap-4 mb-6 text-gray-600 dark:text-gray-300">
                    <span>⏱️ {recipe.prepTime || '?'} minutes</span>
                    <span>📊 {recipe.difficulty}</span>
                    <span>🍽️ {recipe.category || 'Non catégorisé'}</span>
                  </div>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {recipe.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full text-sm bg-secondary-100 dark:bg-gray-700 text-neutral-700 dark:text-white">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Ingrédients */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-white">Ingrédients</h3>
                    <ul className="space-y-2">
                      {recipe.ingredients && recipe.ingredients.map((ing, index) => (
                        <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#ffb6c1'}} />
                          {ing.quantity} {ing.unit} {ing.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Étapes */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-white">Préparation</h3>
                    <ol className="space-y-4">
                      {recipe.steps && recipe.steps.map((step, index) => (
                        <li key={index} className="flex text-gray-700 dark:text-gray-300">
                          <span className="font-bold mr-4" style={{color: '#ffb6c1'}}>{index + 1}.</span>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* SECTION COMMENTAIRES - AVEC CONFIRMATION */}
                  <CommentsSection recipeId={recipe.id} />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmation pour l'ajout à la liste */}
      <ConfirmModal
        isOpen={showAddToListConfirm}
        onClose={() => setShowAddToListConfirm(false)}
        onConfirm={handleAddToShoppingList}
        title="🛒 Ajouter à la liste de courses"
        message={
          <div className="text-neutral-700 dark:text-gray-200">
            <p className="mb-2">Voulez-vous ajouter à votre liste de courses :</p>
            <p className="font-semibold text-lg text-neutral-700 dark:text-white">"{recipe?.title}"</p>
          </div>
        }
        confirmText="Oui, ajouter"
        cancelText="Non"
      />
    </>
  );
};

export default ViewRecipeModal;