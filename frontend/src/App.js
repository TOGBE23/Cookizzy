import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { store } from './store/store';
import { loadUser } from './store/slices/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SearchRecipes from './pages/SearchRecipes';
import MyRecipes from './pages/MyRecipes';
import AddRecipe from './pages/AddRecipe';
import RecipeDetail from './pages/RecipeDetail';
import EditRecipe from './pages/EditRecipe';
import ShoppingList from './pages/ShoppingList';
import Profile from './pages/Profile';

function AppContent() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  setIsLoading(false);
}, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      {/* Bouton theme toggle flottant */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Notifications toast */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              borderLeft: '4px solid #4caf50',
              background: '#f0f9f0',
            },
          },
          error: {
            duration: 4000,
            icon: '❌',
            style: {
              borderLeft: '4px solid #f44336',
              background: '#fef2f2',
            },
          },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />
          
          {/* Redirections vers la page d'accueil avec modals */}
          <Route path="/login" element={<Navigate to="/" state={{ openLogin: true }} replace />} />
          <Route path="/register" element={<Navigate to="/" state={{ openRegister: true }} replace />} />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <SearchRecipes />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-recipes"
            element={
              <PrivateRoute>
                <MyRecipes />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-recipe"
            element={
              <PrivateRoute>
                <AddRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/recipe/:id"
            element={
              <PrivateRoute>
                <RecipeDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-recipe/:id"
            element={
              <PrivateRoute>
                <EditRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <PrivateRoute>
                <ShoppingList />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {/* ✅ CORRECTION : Router déplacé ici pour envelopper tout l'app */}
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;