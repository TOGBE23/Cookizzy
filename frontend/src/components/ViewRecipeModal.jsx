import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    // Optionnel: message de succès
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10" style={{borderColor: '#ffb6c1'}}>
              <h2 className="text-2xl font-bold" style={{color: '#8b5a2b'}}>Détail de la recette</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Corps */}
            <div className="p-6">
              {/* Image */}
              {recipe.imageUrl ? (
                <img 
                  src={`http://localhost:5000${recipe.imageUrl}`} 
                  alt={recipe.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-6xl">🍳</span>
                </div>
              )}

              {/* Titre et like */}
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold" style={{color: '#8b5a2b'}}>{recipe.title}</h1>
                <LikeButton recipeId={recipe.id} initialLikes={recipe.likes || 0} />
              </div>

              {/* Note moyenne - DÉJÀ PRÉSENT */}
              {recipeRating.total > 0 && (
                <div className="mb-4">
                  <RatingStars rating={recipeRating.average} total={recipeRating.total} readonly />
                </div>
              )}

              {/* Bouton ajouter à la liste */}
              <button
                onClick={() => setShowAddToListConfirm(true)}
                className="mb-6 px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
                style={{backgroundColor: '#ffb347'}}
              >
                🛒 Ajouter à ma liste de courses
              </button>

              {/* Description */}
              {recipe.description && (
                <p className="text-gray-700 mb-6">{recipe.description}</p>
              )}

              {/* Métadonnées */}
              <div className="flex gap-4 mb-6 text-gray-600">
                <span>⏱️ {recipe.prepTime || '?'} minutes</span>
                <span>📊 {recipe.difficulty}</span>
                <span>🍽️ {recipe.category || 'Non catégorisé'}</span>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm" style={{backgroundColor: '#ffd8b0', color: '#8b5a2b'}}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingrédients */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#8b5a2b'}}>Ingrédients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients && recipe.ingredients.map((ing, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#ffb6c1'}}></span>
                      <span className="text-gray-700">
                        {ing.quantity} {ing.unit} {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Étapes */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#8b5a2b'}}>Préparation</h3>
                <ol className="space-y-4">
                  {recipe.steps && recipe.steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-bold mr-4" style={{color: '#ffb6c1'}}>{index + 1}.</span>
                      <p className="text-gray-700">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* SECTION COMMENTAIRES - DÉJÀ PRÉSENTE */}
              <CommentsSection recipeId={recipe.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation pour l'ajout à la liste */}
      <ConfirmModal
        isOpen={showAddToListConfirm}
        onClose={() => setShowAddToListConfirm(false)}
        onConfirm={handleAddToShoppingList}
        title="🛒 Ajouter à la liste de courses"
        message={`Voulez-vous ajouter "${recipe?.title}" à votre liste de courses ?`}
        confirmText="Oui, ajouter"
        cancelText="Non"
      />
    </>
  );
};

export default ViewRecipeModal;