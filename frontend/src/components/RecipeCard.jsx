import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const RecipeCard = ({ recipe, isOwner, onDelete, onAddToList }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(recipe.likes || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? 'Like retiré' : 'Like ajouté !', {
      position: 'bottom-center',
      duration: 1500,
    });
  };

  const handleAddToList = (e) => {
    e.stopPropagation();
    onAddToList(recipe);
    toast.success(`Ajouté à la liste !`, {
      position: 'bottom-center',
      duration: 1500,
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(recipe);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium overflow-hidden cursor-pointer transition-all"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      {/* Image avec ratio fixe */}
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
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
            recipe.difficulty === 'Facile' ? 'bg-green-500' :
            recipe.difficulty === 'Moyen' ? 'bg-yellow-500' : 'bg-red-500'
          } text-white`}>
            {recipe.difficulty === 'Facile' ? 'F' : recipe.difficulty === 'Moyen' ? 'M' : 'D'}
            <span className="hidden sm:inline ml-1">{recipe.difficulty}</span>
          </span>
        </div>

        {/* Bouton like mobile friendly */}
        <button
          onClick={handleLike}
          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
        >
          {isLiked ? (
            <HeartSolid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Contenu compact */}
      <div className="p-2 sm:p-3 lg:p-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-neutral-dark dark:text-white line-clamp-1 mb-1">
          {recipe.title}
        </h3>

        {/* Métadonnées compactes */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>⏱️ {recipe.prepTime || '?'}</span>
          <span>📊 {recipe.difficulty}</span>
          <span>❤️ {likesCount}</span>
        </div>

        {/* Tags responsives */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-2">
            {recipe.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-1 sm:px-2 py-0.5 text-[8px] sm:text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-neutral-dark dark:text-white truncate max-w-[60px] sm:max-w-[80px]"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="text-[8px] sm:text-xs text-gray-500">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Boutons d'action compacts */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/recipe/${recipe.id}`);
            }}
            className="p-1.5 sm:p-2 bg-primary-100 dark:bg-primary-900 text-neutral-dark dark:text-white rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-xs sm:text-sm"
            title="Voir"
          >
            👁️
          </button>
          
          {isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-recipe/${recipe.id}`);
                }}
                className="p-1.5 sm:p-2 bg-secondary-100 dark:bg-gray-700 text-neutral-dark dark:text-white rounded-lg hover:bg-secondary-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
                title="Modifier"
              >
                ✏️
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-xs sm:text-sm"
                title="Supprimer"
              >
                🗑️
              </button>
            </>
          )}
          
          <button
            onClick={handleAddToList}
            className="p-1.5 sm:p-2 text-white rounded-lg hover:opacity-80 transition-colors text-xs sm:text-sm"
            style={{ backgroundColor: '#ffb6c1' }}
            title="Ajouter à la liste"
          >
            🛒
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;