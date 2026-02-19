const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload de photos de profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Route users fonctionne' });
});

// Obtenir le profil d'un utilisateur
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;

  db.get(
    'SELECT id, username, email, profileImage, bio, role, createdAt FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    }
  );
});

// Mettre à jour le profil (protégé)
router.put('/profile', auth, upload.single('profileImage'), (req, res) => {
  const userId = req.userId;
  const { username, email, bio, currentPassword, newPassword } = req.body;
  
  console.log('Mise à jour profil - User ID:', userId);
  console.log('Données reçues:', { username, email, bio, currentPassword: !!currentPassword, newPassword: !!newPassword });
  console.log('Fichier:', req.file);

  // Vérifier que l'utilisateur existe
  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si le nouvel email est déjà pris
    if (email && email !== user.email) {
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
        if (err) {
          console.error('Erreur DB:', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (existingUser) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        proceedWithUpdate();
      });
    } else {
      proceedWithUpdate();
    }

    async function proceedWithUpdate() {
      // Vérifier le mot de passe si changement demandé
      let hashedPassword = user.password;
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Mot de passe actuel requis' });
        }
        
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }
        
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // Déterminer la nouvelle URL de l'image de profil
      let profileImage = user.profileImage;
      if (req.file) {
        profileImage = `/uploads/profiles/${req.file.filename}`;
      } else if (req.body.removeImage === 'true') {
        profileImage = null;
      }

      // Mettre à jour l'utilisateur
      db.run(
        `UPDATE users 
         SET username = COALESCE(?, username),
             email = COALESCE(?, email),
             bio = COALESCE(?, bio),
             password = ?,
             profileImage = COALESCE(?, profileImage)
         WHERE id = ?`,
        [
          username || null,
          email || null,
          bio || null,
          hashedPassword,
          profileImage || null,
          userId
        ],
        function(err) {
          if (err) {
            console.error('Erreur DB:', err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
          }

          // Récupérer l'utilisateur mis à jour
          db.get(
            'SELECT id, username, email, profileImage, bio, role FROM users WHERE id = ?',
            [userId],
            (err, updatedUser) => {
              if (err) {
                return res.json({ message: 'Profil mis à jour' });
              }
              res.json(updatedUser);
            }
          );
        }
      );
    }
  });
});

// Supprimer le compte (protégé)
router.delete('/profile', auth, (req, res) => {
  const userId = req.userId;

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
    res.json({ message: 'Compte supprimé avec succès' });
  });
});

module.exports = router;