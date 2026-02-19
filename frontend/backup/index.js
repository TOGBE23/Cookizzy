import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import './index.css';

const store = configureStore({
  reducer: { test: (state = {}) => state }
});

function Home() {
  return <h2>Page d'accueil</h2>;
}

function About() {
  return <h2>À propos</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{padding: '10px', background: '#f0f0f0'}}>
          <Link to="/" style={{marginRight: '10px'}}>Accueil</Link>
          <Link to="/about">À propos</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);