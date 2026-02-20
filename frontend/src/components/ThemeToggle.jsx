import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/outline';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50"
      style={{
        backgroundColor: isDarkMode ? '#f0e6d2' : '#8b5a2b',
        color: isDarkMode ? '#1a1a1a' : '#f5f0e8',
      }}
    >
      <motion.div
        key={isDarkMode ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? (
          <SunIcon className="w-6 h-6" />
        ) : (
          <MoonIcon className="w-6 h-6" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;