import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { token, isLoading } = useSelector((state) => state.auth);
  
  // ✅ CORRECTION : Attendre que le chargement soit terminé avant de rediriger
  // Evite la redirection prématurée quand l'utilisateur est connecté
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-transparent"></div>
      </div>
    );
  }
  
  // Si pas de token, rediriger vers l'accueil (qui ouvrira le modal login)
  if (!token) {
    return <Navigate to="/" />;
  }
  
  // Sinon, afficher le composant enfant
  return children;
};

export default PrivateRoute;
