import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
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
              Connectez-vous à votre compte
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main dark:bg-primary-dark text-white py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </motion.button>

            <p className="text-center text-sm text-neutral-600 dark:text-gray-300">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-dark dark:text-primary-light hover:underline font-medium">
                S'inscrire
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;