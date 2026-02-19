import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  
  // Si pas de token, rediriger vers login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Sinon, afficher le composant enfant
  return children;
};

export default PrivateRoute;