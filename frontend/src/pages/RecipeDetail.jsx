import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecipeById, deleteRecipe } from '../store/slices/recipeSlice';
import { fetchRating } from '../store/slices/socialSlice';
import { addRecipeToSelection } from '../store/slices/shoppingSlice';
import LikeButton from '../components/LikeButton';
import CommentsSection from '../components/CommentsSection';
import RatingStars from '../components/RatingStars';
import ConfirmModal from '../components/ConfirmModal';

const RecipeDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentRecipe: recipe, isLoading } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.auth);
  const { ratings } = useSelector((state) => state.social);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddToListConfirm, setShowAddToListConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchRecipeById(id));
    dispatch(fetchRating(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    dispatch(deleteRecipe(id));
    navigate('/my-recipes');
  };

  const handleAddToShoppingList = () => {
    if (recipe) {
      dispatch(addRecipeToSelection(recipe.id));
      setShowAddToListConfirm(false);
      // Optionnel: message toast ou notification
    }
  };

  if (isLoading || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#c4a484'}}></div>
      </div>
    );
  }

  const isAuthor = user && recipe.authorId === user.id;
  const recipeRating = ratings[id] || { average: 0, total: 0 };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton retour (simple, pas une navbar) */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
          style={{backgroundColor: '#a0522d'}}
        >
          ← Retour
        </button>

        {/* Image */}
        {recipe.imageUrl ? (
          <img 
            src={`http://localhost:5000${recipe.imageUrl}`} 
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-t-lg"
          />
        ) : (
          <div className="h-64 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-t-lg flex items-center justify-center">
            <span className="text-6xl">🍳</span>
          </div>
        )}

        <div className="bg-white rounded-b-lg shadow p-8">
          {/* En-tête avec titre et likes */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold" style={{color: '#8b5a2b'}}>{recipe.title}</h1>
            <LikeButton recipeId={id} initialLikes={recipe.likes || 0} />
          </div>

          {/* Note moyenne */}
          {recipeRating.total > 0 && (
            <div className="mb-4">
              <RatingStars rating={recipeRating.average} total={recipeRating.total} readonly />
            </div>
          )}

          {/* Boutons d'action pour l'auteur */}
          {isAuthor && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                className="px-4 py-2 rounded-md text-white hover:opacity-80 transition"
                style={{backgroundColor: '#c4a484'}}
              >
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-md text-white hover:opacity-80 transition"
                style={{backgroundColor: '#ffb6c1'}}
              >
                Supprimer
              </button>
            </div>
          )}

          {/* Bouton pour tous (ajouter à la liste) */}
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
            <h2 className="text-2xl font-semibold mb-4" style={{color: '#8b5a2b'}}>Ingrédients</h2>
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
            <h2 className="text-2xl font-semibold mb-4" style={{color: '#8b5a2b'}}>Préparation</h2>
            <ol className="space-y-4">
              {recipe.steps && recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="font-bold mr-4" style={{color: '#ffb6c1'}}>{index + 1}.</span>
                  <p className="text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Section commentaires */}
          <CommentsSection recipeId={id} />
        </div>
      </div>

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* Modal de confirmation pour l'ajout à la liste */}
      <ConfirmModal
        isOpen={showAddToListConfirm}
        onClose={() => setShowAddToListConfirm(false)}
        onConfirm={handleAddToShoppingList}
        title="Ajouter à la liste de courses"
        message={`Voulez-vous ajouter "${recipe?.title}" à votre liste de courses ?`}
        confirmText="Oui, ajouter"
        cancelText="Non"
      />
    </div>
  );
};

export default RecipeDetail;