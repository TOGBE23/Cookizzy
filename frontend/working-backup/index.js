import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">
          🍳 Plateforme de Recettes
        </h1>
        <p className="text-gray-700">
          Si vous voyez ce message, React fonctionne correctement !
        </p>
        <button 
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => alert('Bravo ! 🎉')}
        >
          Cliquez ici
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);