import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const showDashboardButton = location.pathname !== '/dashboard' && location.pathname !== '/' && user;

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleOpenLogin = () => {
    navigate('/', { state: { openLogin: true } });
    setIsMenuOpen(false);
  };

  const handleOpenRegister = () => {
    navigate('/', { state: { openRegister: true } });
    setIsMenuOpen(false);
  };

  return (
    <nav className="shadow-lg sticky top-0 z-50" style={{backgroundColor: '#c4a484'}}>
      <div className="px-2 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {showDashboardButton && (
              <button
                onClick={handleGoToDashboard}
                className="p-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition flex items-center gap-1"
                style={{backgroundColor: '#a0522d'}}
              >
                <span className="hidden sm:inline">🏠 Tableau de bord</span>
                <span className="sm:hidden">🏠</span>
              </button>
            )}
            <Link to="/" className="text-lg sm:text-xl font-bold text-white truncate max-w-[120px] sm:max-w-none flex items-center gap-1">
              <span>🍲</span>
              <span className="hidden xs:inline">Cookizzy</span>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                <Link to="/search" className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#fff9e6'}}>
                  <span className="hidden lg:inline">🔍 Rechercher</span>
                  <span className="lg:hidden">🔍</span>
                </Link>
                <Link to="/my-recipes" className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#d8f0d8'}}>
                  <span className="hidden lg:inline">📋 Mes recettes</span>
                  <span className="lg:hidden">📋</span>
                </Link>
                <Link to="/profile" className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#ffb6c1'}}>
                  <span className="hidden lg:inline">👤 Profil</span>
                  <span className="lg:hidden">👤</span>
                </Link>
                <Link to="/shopping-list" className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#ffd0d0'}}>
                  <span className="hidden lg:inline">🛒 Liste</span>
                  <span className="lg:hidden">🛒</span>
                </Link>
                <span className="text-sm text-white hidden xl:inline">Bonjour, {user?.username || ''} !</span>
                <button onClick={handleLogout} className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#a8a8a8'}}>
                  <span className="hidden lg:inline">Déconnexion</span>
                  <span className="lg:hidden">🚪</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={handleOpenLogin} className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#fff9e6'}}>
                  <span className="hidden sm:inline">Connexion</span>
                  <span className="sm:hidden">🔑</span>
                </button>
                <button onClick={handleOpenRegister} className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition whitespace-nowrap" style={{backgroundColor: '#ffb6c1'}}>
                  <span className="hidden sm:inline">Inscription</span>
                  <span className="sm:hidden">📝</span>
                </button>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-white hover:opacity-80 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{backgroundColor: '#c4a484'}}
          >
            <div className="px-4 py-2 space-y-2 border-t border-white/20">
              {user ? (
                <>
                  <button onClick={handleGoToDashboard} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition flex items-center gap-2" style={{backgroundColor: '#a0522d'}}>🏠 Tableau de bord</button>
                  <Link to="/search" onClick={() => handleLinkClick('/search')} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition" style={{backgroundColor: '#fff9e6'}}>🔍 Rechercher</Link>
                  <Link to="/my-recipes" onClick={() => handleLinkClick('/my-recipes')} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition" style={{backgroundColor: '#d8f0d8'}}>📋 Mes recettes</Link>
                  <Link to="/profile" onClick={() => handleLinkClick('/profile')} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition" style={{backgroundColor: '#ffb6c1'}}>👤 Profil</Link>
                  <Link to="/shopping-list" onClick={() => handleLinkClick('/shopping-list')} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition" style={{backgroundColor: '#ffd0d0'}}>🛒 Liste</Link>
                  <div className="text-sm text-white px-3 py-2">👋 Bonjour, {user?.username || ''} !</div>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition" style={{backgroundColor: '#a8a8a8'}}>🚪 Déconnexion</button>
                </>
              ) : (
                <>
                  <button onClick={handleOpenLogin} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition" style={{backgroundColor: '#fff9e6'}}>🔑 Connexion</button>
                  <button onClick={handleOpenRegister} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition" style={{backgroundColor: '#ffb6c1'}}>📝 Inscription</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;