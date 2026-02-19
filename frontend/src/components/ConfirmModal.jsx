import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex justify-between items-center p-4 border-b" style={{borderColor: '#ffb6c1'}}>
            <h3 className="text-lg font-semibold" style={{color: '#8b5a2b'}}>{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Corps */}
          <div className="p-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Pied */}
          <div className="flex justify-end gap-3 p-4 border-t" style={{borderColor: '#f5f0e8'}}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
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
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;