const express = require('express');
const cors = require('cors');
// const dotenv = require('dotenv');
const path = require('path');

// dotenv.config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedDomains = [
      'localhost:3000',
      'localhost:5000',
      'cookizzy.vercel.app',
      'cookizzy-backend.onrender.com',
      'togbe23s-projects.vercel.app',
      'vercel.app'
    ];
    
    const isAllowed = allowedDomains.some(domain => origin.includes(domain));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ Origine bloquée par CORS:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les images statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const recipesRoutes = require('./routes/recipes');
const usersRoutes = require('./routes/users');
const socialRoutes = require('./routes/social');

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/social', socialRoutes);

// Route de test simple
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Cookizzy fonctionne !' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Base de données
const db = require('./config/database');

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Cookizzy backend démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS configuré pour accepter les domaines:`);
  console.log(`   - localhost:3000`);
  console.log(`   - cookizzy.vercel.app`);
  console.log(`   - *.togbe23s-projects.vercel.app`);
  console.log(`   - *.vercel.app`);
});