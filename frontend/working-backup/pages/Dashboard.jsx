import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const username = user ? user.username : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Bienvenue sur votre tableau de bord, {username} !
        </h1>
        <p className="text-gray-600">
          Vous êtes maintenant connecté. L'authentification fonctionne parfaitement !
        </p>
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          ✅ Authentification réussie avec JWT
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Mes recettes</h3>
            <p className="text-gray-600">0 recette</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Mes favoris</h3>
            <p className="text-gray-600">0 recette</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Liste de courses</h3>
            <p className="text-gray-600">0 article</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;