import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const showBackButton = !['/dashboard', '/', '/login', '/register'].includes(location.pathname);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <nav className="shadow-lg" style={{backgroundColor: '#c4a484'}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition flex items-center gap-1"
                style={{backgroundColor: '#a0522d'}}
              >
                ← Retour
              </button>
            )}
            <Link to="/" className="text-xl font-bold text-white">
              🍪 Cookizzy
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/search"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition"
                  style={{backgroundColor: '#fff9e6'}}
                >
                  🔍 Rechercher
                </Link>
                <Link
                  to="/my-recipes"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition"
                  style={{backgroundColor: '#d8f0d8'}}
                >
                  📋 Mes recettes
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition"
                  style={{backgroundColor: '#ffb6c1'}}
                >
                  👤 Profil
                </Link>
                <Link
                  to="/shopping-list"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition"
                  style={{backgroundColor: '#ffd0d0'}}
                >
                  🛒 Liste
                </Link>
                <span className="text-sm text-white">
                  Bonjour, {user?.username || ''} !
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition"
                  style={{backgroundColor: '#a8a8a8'}}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:opacity-80 transition"
                  style={{backgroundColor: '#fff9e6'}}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-80 transition"
                  style={{backgroundColor: '#ffb6c1'}}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;