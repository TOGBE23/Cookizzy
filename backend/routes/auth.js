const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le username existe déjà
    const existingUsername = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Générer le token JWT
    const token = jwt.sign(
      { id: userId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('✅ Nouvel utilisateur créé:', { id: userId, username, email });

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Chercher l'utilisateur
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('✅ Connexion réussie pour:', user.email);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Profil
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Non autorisé' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, "profileImage" FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ user });
  } catch (error) {
    console.error('❌ Erreur profil:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
});

module.exports = router;