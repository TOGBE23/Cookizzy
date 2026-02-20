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
import Login from './pages/Login';
import Register from './pages/Register';
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
    if (token) {
      dispatch(loadUser()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        
        {/* Bouton theme toggle flottant */}
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Configuration des notifications toast */}
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
            loading: {
              duration: Infinity,
              icon: '⏳',
              style: {
                borderLeft: '4px solid #ffb6c1',
              },
            },
          }}
        />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;