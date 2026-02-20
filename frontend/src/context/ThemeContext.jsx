import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('cookizzy-theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('cookizzy-theme', JSON.stringify(isDarkMode));
    
    // Appliquer les classes au document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
      document.documentElement.style.setProperty('--surface-color', '#2d2d2d');
      document.documentElement.style.setProperty('--text-color', '#f0e6d2');
      document.documentElement.style.setProperty('--text-secondary', '#c4a484');
      document.documentElement.style.setProperty('--border-color', '#404040');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--bg-color', '#f5f0e8');
      document.documentElement.style.setProperty('--surface-color', '#ffffff');
      document.documentElement.style.setProperty('--text-color', '#8b5a2b');
      document.documentElement.style.setProperty('--text-secondary', '#a0522d');
      document.documentElement.style.setProperty('--border-color', '#e8ddd0');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};