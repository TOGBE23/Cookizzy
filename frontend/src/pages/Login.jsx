import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, clearError } from '../store/slices/authSlice';

const Login = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  // Log au chargement
  console.log('🔵 Login rendu, onSuccess présent:', !!onSuccess);

  useEffect(() => {
    console.log('🟡 useEffect - user:', user);
    console.log('🟡 useEffect - onSuccess:', !!onSuccess);
    
    if (user) {
      console.log('🟢 UTILISATEUR CONNECTÉ DÉTECTÉ');
      
      if (onSuccess) {
        console.log('🟢 Appel de onSuccess()');
        onSuccess(); // Appelle handleLoginSuccess dans Home
      } else {
        console.log('🔴 Redirection directe vers dashboard');
        navigate('/dashboard');
      }
    }
  }, [user, navigate, onSuccess]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ← EMPÊCHE LE RECHARGEMENT DE LA PAGE
    console.log('🟠 SUBMIT - Tentative connexion avec:', formData.email);
    
    const result = await dispatch(login(formData));
    console.log('🟠 Résultat du login:', result);
    
    if (result.error) {
      console.error('❌ Erreur de connexion:', result.error);
    }
    // La redirection est gérée par le useEffect quand user change
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-gray-200 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-gray-200 mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"  // ← CRUCIAL : indique que c'est le bouton de soumission
        disabled={isLoading}
        className="w-full bg-primary-main dark:bg-primary-dark text-white py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </motion.button>
    </form>
  );
};

export default Login;