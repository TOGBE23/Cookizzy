import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, clearError } from '../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) dispatch(clearError());
    setPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register(registerData));
    
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-700 dark:text-white">🍪 Cookizzy</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-gray-300">
              Créez votre compte gratuitement
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-gray-200 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                placeholder="Jean Dupont"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

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
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-gray-200 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {(error || passwordError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm"
              >
                {passwordError || error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main dark:bg-primary-dark text-white py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Inscription en cours...' : "S'inscrire"}
            </motion.button>

            <p className="text-center text-sm text-neutral-600 dark:text-gray-300">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-dark dark:text-primary-light hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;