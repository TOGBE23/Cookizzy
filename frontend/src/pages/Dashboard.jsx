import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg shadow p-6" style={{backgroundColor: '#ffffff'}}>
          <h1 className="text-2xl font-bold mb-4" style={{color: '#8b5a2b'}}>
            Bienvenue sur Cookizzy, {username} !
          </h1>
          
          <div className="p-4 rounded-lg mb-6" style={{backgroundColor: '#ffd8b0', color: '#b45f06'}}>
            ✅ Connecté avec succès !
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total recettes - Rose */}
            <div 
              className="rounded-lg shadow p-6 cursor-pointer hover:opacity-80 transition"
              style={{backgroundColor: '#ffb6c1'}}
              onClick={() => navigate('/my-recipes')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: '#8b5a2b'}}>Total recettes</p>
                  <p className="text-3xl font-bold" style={{color: '#8b5a2b'}}>{totalRecipes}</p>
                </div>
                <span className="text-4xl">📋</span>
              </div>
            </div>

            {/* Temps moyen - Jaune poussin */}
            <div className="rounded-lg shadow p-6" style={{backgroundColor: '#fff9e6'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: '#8b5a2b'}}>Temps moyen</p>
                  <p className="text-3xl font-bold" style={{color: '#8b5a2b'}}>{avgPrepTime} min</p>
                </div>
                <span className="text-4xl">⏱️</span>
              </div>
            </div>

            {/* Catégorie favorite - Orange */}
            <div className="rounded-lg shadow p-6" style={{backgroundColor: '#ffb347'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: '#8b5a2b'}}>Catégorie favorite</p>
                  <p className="text-xl font-bold truncate max-w-[150px]" style={{color: '#8b5a2b'}}>{favoriteCategory}</p>
                </div>
                <span className="text-4xl">🏆</span>
              </div>
            </div>

            {/* Difficulté - Marron clair */}
            <div className="rounded-lg shadow p-6" style={{backgroundColor: '#c4a484'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Difficulté</p>
                  <p className="text-xl font-bold text-white">
                    {Object.keys(recipesByDifficulty).length > 0 
                      ? Object.keys(recipesByDifficulty).reduce((a, b) => 
                          recipesByDifficulty[a] > recipesByDifficulty[b] ? a : b
                        )
                      : 'Aucune'}
                  </p>
                </div>
                <span className="text-4xl">📊</span>
              </div>
            </div>

            {/* Liste de courses - Rose clair */}
            <div 
              className="rounded-lg shadow p-6 cursor-pointer hover:opacity-80 transition"
              style={{backgroundColor: '#ffd0d0'}}
              onClick={() => navigate('/shopping-list')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: '#8b5a2b'}}>Liste de courses</p>
                  <p className="text-3xl font-bold" style={{color: '#8b5a2b'}}>{selectedRecipes?.length || 0}</p>
                </div>
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-xs mt-2" style={{color: '#8b5a2b'}}>recettes dans la liste</p>
            </div>
          </div>

          {totalRecipes > 0 && (
            <div className="rounded-lg p-6 mb-8" style={{backgroundColor: '#f5f0e8'}}>
              <h2 className="text-lg font-semibold mb-4" style={{color: '#8b5a2b'}}>Répartition par difficulté</h2>
              <div className="space-y-3">
                {['Facile', 'Moyen', 'Difficile'].map(diff => {
                  const count = recipesByDifficulty[diff] || 0;
                  const percentage = totalRecipes > 0 ? (count / totalRecipes) * 100 : 0;
                  
                  return (
                    <div key={diff}>
                      <div className="flex justify-between text-sm mb-1" style={{color: '#8b5a2b'}}>
                        <span>{diff}</span>
                        <span className="font-medium">{count} recette{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            diff === 'Facile' ? 'bg-green-400' : 
                            diff === 'Moyen' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-6 rounded-lg hover:opacity-80 transition text-left"
              style={{backgroundColor: '#ffb6c1'}}
            >
              <span className="text-3xl block mb-2">➕</span>
              <h3 className="font-semibold text-lg" style={{color: '#8b5a2b'}}>Ajouter une recette</h3>
              <p className="text-sm" style={{color: '#8b5a2b'}}>Partagez une nouvelle recette avec la communauté Cookizzy</p>
            </button>

            <button
              onClick={() => navigate('/my-recipes')}
              className="p-6 rounded-lg hover:opacity-80 transition text-left"
              style={{backgroundColor: '#d8f0d8'}}
            >
              <span className="text-3xl block mb-2">📋</span>
              <h3 className="font-semibold text-lg" style={{color: '#8b5a2b'}}>Voir mes recettes</h3>
              <p className="text-sm" style={{color: '#8b5a2b'}}>{totalRecipes} recette{totalRecipes > 1 ? 's' : ''} publiée{totalRecipes > 1 ? 's' : ''}</p>
            </button>
          </div>

          {userRecipes && userRecipes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{color: '#8b5a2b'}}>📌 Dernières recettes Cookizzy</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userRecipes.slice(0, 3).map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
                    style={{backgroundColor: '#fff9e6'}}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    {recipe.imageUrl ? (
                      <img 
                        src={`http://localhost:5000${recipe.imageUrl}`} 
                        alt={recipe.title}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center" style={{backgroundColor: '#f5f0e8'}}>
                        <span className="text-3xl">🍳</span>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold truncate" style={{color: '#8b5a2b'}}>{recipe.title}</h3>
                      <p className="text-xs" style={{color: '#a0522d'}}>
                        ⏱️ {recipe.prepTime || '?'} min • 📊 {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
          }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;