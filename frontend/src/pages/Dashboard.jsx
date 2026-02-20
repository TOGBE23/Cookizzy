import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchUserRecipes } from '../store/slices/recipeSlice';
import { logout } from '../store/slices/authSlice';
import Modal from '../components/Modal';
import AddRecipeForm from '../components/AddRecipeForm';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { userRecipes } = useSelector((state) => state.recipes);
  const { selectedRecipes } = useSelector((state) => state.shopping || { selectedRecipes: [] });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const username = user ? user.username : '';

  useEffect(() => {
    if (user) {
      dispatch(fetchUserRecipes(user.id));
    }
  }, [dispatch, user]);

  const totalRecipes = userRecipes ? userRecipes.length : 0;
  
  const recipesByDifficulty = userRecipes ? userRecipes.reduce((acc, recipe) => {
    acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
    return acc;
  }, {}) : {};

  const avgPrepTime = userRecipes && userRecipes.length > 0
    ? Math.round(userRecipes.reduce((sum, recipe) => sum + (recipe.prepTime || 0), 0) / userRecipes.length)
    : 0;

  const categories = userRecipes ? userRecipes.reduce((acc, recipe) => {
    if (recipe.category) {
      acc[recipe.category] = (acc[recipe.category] || 0) + 1;
    }
    return acc;
  }, {}) : {};

  const favoriteCategory = Object.keys(categories).length > 0
    ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
    : 'Aucune';

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6"
        >
          {/* En-tête */}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl font-bold mb-4 text-neutral-700 dark:text-white"
          >
            Bienvenue sur Cookizzy, {username} !
          </motion.h1>
          
          {/* Message de bienvenue */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg mb-6 bg-secondary-100 dark:bg-gray-700 text-secondary-dark dark:text-gray-200"
          >
            ✅ Connecté avec succès !
          </motion.div>

          {/* Cartes de statistiques */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8"
          >
            {/* Total recettes - Rose */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-soft p-4 sm:p-6 cursor-pointer hover:shadow-medium transition-all"
              style={{backgroundColor: '#ffb6c1'}}
              onClick={() => navigate('/my-recipes')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-700">Total recettes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-neutral-700">{totalRecipes}</p>
                </div>
                <span className="text-3xl sm:text-4xl">📋</span>
              </div>
            </motion.div>

            {/* Temps moyen - Jaune poussin */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-soft p-4 sm:p-6 cursor-pointer hover:shadow-medium transition-all"
              style={{backgroundColor: '#fff9e6'}}
              onClick={() => navigate('/search')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-700">Temps moyen</p>
                  <p className="text-2xl sm:text-3xl font-bold text-neutral-700">{avgPrepTime} min</p>
                </div>
                <span className="text-3xl sm:text-4xl">⏱️</span>
              </div>
            </motion.div>

            {/* Catégorie favorite - Orange */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-soft p-4 sm:p-6 cursor-pointer hover:shadow-medium transition-all"
              style={{backgroundColor: '#ffb347'}}
              onClick={() => navigate('/search')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-700">Catégorie favorite</p>
                  <p className="text-base sm:text-xl font-bold truncate max-w-[120px] sm:max-w-[150px] text-neutral-700">
                    {favoriteCategory}
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl">🏆</span>
              </div>
            </motion.div>

            {/* Difficulté - Marron clair */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-soft p-4 sm:p-6 cursor-pointer hover:shadow-medium transition-all"
              style={{backgroundColor: '#c4a484'}}
              onClick={() => navigate('/search')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-white">Difficulté</p>
                  <p className="text-base sm:text-xl font-bold text-white">
                    {Object.keys(recipesByDifficulty).length > 0 
                      ? Object.keys(recipesByDifficulty).reduce((a, b) => 
                          recipesByDifficulty[a] > recipesByDifficulty[b] ? a : b
                        )
                      : 'Aucune'}
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl">📊</span>
              </div>
            </motion.div>

            {/* Liste de courses - Rose clair */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-soft p-4 sm:p-6 cursor-pointer hover:shadow-medium transition-all"
              style={{backgroundColor: '#ffd0d0'}}
              onClick={() => navigate('/shopping-list')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-700">Liste de courses</p>
                  <p className="text-2xl sm:text-3xl font-bold text-neutral-700">{selectedRecipes?.length || 0}</p>
                </div>
                <span className="text-3xl sm:text-4xl">🛒</span>
              </div>
              <p className="text-[10px] sm:text-xs mt-2 text-neutral-700">recettes dans la liste</p>
            </motion.div>
          </motion.div>

          {/* Graphique des difficultés */}
          {totalRecipes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-4 sm:p-6 mb-8 bg-neutral-100 dark:bg-gray-700"
            >
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-neutral-700 dark:text-white">
                Répartition par difficulté
              </h2>
              <div className="space-y-3">
                {['Facile', 'Moyen', 'Difficile'].map((diff, index) => {
                  const count = recipesByDifficulty[diff] || 0;
                  const percentage = totalRecipes > 0 ? (count / totalRecipes) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={diff}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex justify-between text-xs sm:text-sm mb-1 text-neutral-700 dark:text-gray-300">
                        <span>{diff}</span>
                        <span className="font-medium">{count} recette{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 sm:h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                          className={`h-2 sm:h-2.5 rounded-full ${
                            diff === 'Facile' ? 'bg-green-400 dark:bg-green-500' : 
                            diff === 'Moyen' ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-red-400 dark:bg-red-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Actions rapides */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddModalOpen(true)}
              className="p-4 sm:p-6 rounded-xl hover:shadow-medium transition-all text-left"
              style={{backgroundColor: '#ffb6c1'}}
            >
              <span className="text-2xl sm:text-3xl block mb-2">➕</span>
              <h3 className="font-semibold text-base sm:text-lg text-neutral-700">Ajouter une recette</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Partagez une nouvelle recette avec la communauté Cookizzy
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/my-recipes')}
              className="p-4 sm:p-6 rounded-xl hover:shadow-medium transition-all text-left"
              style={{backgroundColor: '#d8f0d8'}}
            >
              <span className="text-2xl sm:text-3xl block mb-2">📋</span>
              <h3 className="font-semibold text-base sm:text-lg text-neutral-700">Voir mes recettes</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                {totalRecipes} recette{totalRecipes > 1 ? 's' : ''} publiée{totalRecipes > 1 ? 's' : ''}
              </p>
            </motion.button>
          </motion.div>

          {/* Dernières recettes */}
          {userRecipes && userRecipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-neutral-700 dark:text-white">
                📌 Dernières recettes Cookizzy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRecipes.slice(0, 3).map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-xl overflow-hidden cursor-pointer hover:shadow-medium transition-all bg-white dark:bg-gray-700"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    {recipe.imageUrl ? (
                      <img 
                        src={`http://localhost:5000${recipe.imageUrl}`} 
                        alt={recipe.title}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-neutral-100 dark:bg-gray-600">
                        <span className="text-3xl">🍳</span>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm sm:text-base truncate text-neutral-700 dark:text-white">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-gray-300">
                        ⏱️ {recipe.prepTime || '?'} min • 📊 {recipe.difficulty}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
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
              toast.success('Recette ajoutée avec succès !', {
                position: 'bottom-center',
                duration: 2000,
                id: 'add-recipe-success'
              });
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;