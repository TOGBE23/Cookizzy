const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier que tous les champs sont présents
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (user) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Vérifier si le username existe déjà
      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, existingUser) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (existingUser) {
          return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(err) {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors de la création' });
            }

            // Générer le token JWT
            const token = jwt.sign(
              { id: this.lastID, email: email },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRE }
            );

            res.status(201).json({
              message: 'Inscription réussie',
              token,
              user: {
                id: this.lastID,
                username,
                email
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que tous les champs sont présents
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Chercher l'utilisateur par email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer le profil (protégée)
router.get('/profile', require('../middleware/auth'), (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;