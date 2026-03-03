const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/database');

const authRoutes = require('./routes/auth');
const recipesRoutes = require('./routes/recipes');
const usersRoutes = require('./routes/users');
const socialRoutes = require('./routes/social');

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/social', socialRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API Cookizzy fonctionne !' });
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Cookizzy backend démarré sur le port ' + PORT);
});

module.exports = app;