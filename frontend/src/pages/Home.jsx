import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';
import Login from './Login';
import Register from './Register';

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Détecter si on vient d'une redirection depuis la navbar
  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
      setShowRegister(false);
      // Nettoyer le state pour éviter de rouvrir au rafraîchissement
      window.history.replaceState({}, document.title);
    }
    if (location.state?.openRegister) {
      setShowRegister(true);
      setShowLogin(false);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const openLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

 // Dans Home.jsx, remplace handleLoginSuccess par :

const handleLoginSuccess = () => {
  console.log('🎯 FONCTION handleLoginSuccess APPELÉE !!!');
  console.log('🎯 Fermeture du modal et redirection...');
  closeModals();
  navigate('/dashboard');
};

  const handleRegisterSuccess = () => {
    closeModals();
    navigate('/dashboard');
  };

  // Statistiques
  const stats = [
    { value: '10k+', label: 'Recettes partagées' },
    { value: '5k+', label: 'Utilisateurs actifs' },
    { value: '50+', label: 'Catégories' },
    { value: '98%', label: 'Satisfaction' }
  ];

  // Témoignages
  const testimonials = [
    {
      name: 'Marie D.',
      role: 'Cheffe à domicile',
      content: 'Cookizzy a révolutionné ma façon de planifier mes repas. La liste de courses automatique est géniale !',
      rating: 5
    },
    {
      name: 'Thomas L.',
      role: 'Étudiant',
      content: 'Simple, intuitif et très pratique. Je recommande à tous ceux qui veulent cuisiner sans se prendre la tête.',
      rating: 5
    },
    {
      name: 'Sophie M.',
      role: 'Maman de famille',
      content: 'Toute ma famille utilise Cookizzy maintenant. Les enfants adorent chercher de nouvelles recettes !',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Éléments décoratifs animés */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="text-center">
          {/* Logo animé */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-block mb-8"
          >
            <span className="text-8xl sm:text-9xl animate-float inline-block">🍲</span>
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-6xl font-bold text-neutral-700 dark:text-white mb-4"
          >
            Bienvenue sur{' '}
            <span className="text-primary-dark dark:text-primary-light bg-clip-text">
              Cookizzy
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-neutral-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            La plateforme qui simplifie votre quotidien culinaire : partagez vos recettes, 
            générez vos listes de courses et découvrez de nouvelles inspirations
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={openRegister}
              className="px-8 py-4 bg-primary-main bg-yellow-300 text-white rounded-lg hover:opacity-90 transition transform hover:scale-105 shadow-lg text-lg font-semibold"
            >
              Commencer gratuitement
            </button>
            <button
              onClick={openLogin}
              className="px-8 py-4 bg-white dark:bg-gray-700 text-neutral-700 dark:text-white rounded-lg hover:shadow-lg transition transform hover:scale-105 border-2 border-primary-main dark:border-primary-dark text-lg font-semibold"
            >
              J'ai déjà un compte
            </button>
          </motion.div>
        </div>
      </div>

      {/* Section Statistiques */}
      <div className="bg-primary-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section "Pourquoi choisir Cookizzy" */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-700 dark:text-white mb-4">
            Pourquoi choisir <span className="text-primary-dark dark:text-primary-light">Cookizzy</span> ?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez ce qui rend notre plateforme unique
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avantages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-xl transition group"
          >
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-white mb-3">Rapidité et simplicité</h3>
            <p className="text-neutral-600 dark:text-gray-300">Ajoutez vos recettes en quelques secondes et générez vos listes de courses automatiquement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-xl transition group"
          >
            <div className="w-16 h-16 bg-secondary-100 dark:bg-gray-700 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-white mb-3">Personnalisation avancée</h3>
            <p className="text-neutral-600 dark:text-gray-300">Tags, catégories, difficulté, temps de préparation... Organisez vos recettes comme vous le souhaitez</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-xl transition group"
          >
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-3xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-white mb-3">Communauté active</h3>
            <p className="text-neutral-600 dark:text-gray-300">Partagez vos créations, découvrez des recettes et échangez avec d'autres passionnés</p>
          </motion.div>
        </div>
      </div>

      {/* Section Témoignages */}
      <div className="bg-neutral-50 dark:bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-xl transition"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <p className="font-bold text-neutral-700 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-neutral-500 dark:text-gray-400">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE CONNEXION */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeModals} />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
              >
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                  <h3 className="text-xl font-bold text-neutral-700 dark:text-white">Connexion</h3>
                  <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <Login onSuccess={handleLoginSuccess} />
                </div>
                <div className="p-6 border-t dark:border-gray-700 text-center">
                  <p className="text-sm text-neutral-600 dark:text-gray-300">
                    Pas encore de compte ?{' '}
                    <button onClick={openRegister} className="text-primary-dark hover:underline font-medium">
                      S'inscrire
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL D'INSCRIPTION */}
      <AnimatePresence>
        {showRegister && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeModals} />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
              >
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                  <h3 className="text-xl font-bold text-neutral-700 dark:text-white">Inscription</h3>
                  <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <Register onSuccess={handleRegisterSuccess} />
                </div>
                <div className="p-6 border-t dark:border-gray-700 text-center">
                  <p className="text-sm text-neutral-600 dark:text-gray-300">
                    Déjà un compte ?{' '}
                    <button onClick={openLogin} className="text-primary-dark hover:underline font-medium">
                      Se connecter
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;