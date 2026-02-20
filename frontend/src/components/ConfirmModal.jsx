import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold" style={{color: '#8b5a2b'}}>{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Corps - ICI LA CORRECTION : utiliser div au lieu de p */}
          <div className="p-6">
            <div className="text-gray-600 dark:text-gray-300">
              {message}
            </div>
          </div>

          {/* Pied */}
          <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-md text-white hover:opacity-80 transition"
              style={{backgroundColor: '#ffb6c1'}}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmModal;