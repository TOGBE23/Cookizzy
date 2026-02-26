const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// S'assurer que le dossier uploads/profiles existe
const profilesDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    else cb(new Error('Seules les images sont autorisées'));
  }
});

// ✅ Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Route users fonctionne' });
});

// ✅ Obtenir le profil d'un utilisateur
router.get('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare(
      'SELECT id, username, email, profileImage, bio, role, createdAt FROM users WHERE id = ?'
    ).get(userId);
    
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Mettre à jour le profil (protégé)
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, bio, currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Vérifier si le nouvel email est déjà pris
    if (email && email !== user.email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingUser) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier le mot de passe si changement demandé
    let hashedPassword = user.password;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Mot de passe actuel requis' });
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Déterminer la nouvelle image de profil
    let profileImage = user.profileImage;
    if (req.file) {
      profileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      profileImage = null;
    }

    db.prepare(
      `UPDATE users SET username=COALESCE(?,username), email=COALESCE(?,email), bio=COALESCE(?,bio), password=?, profileImage=? WHERE id=?`
    ).run(username || null, email || null, bio || null, hashedPassword, profileImage, userId);

    const updatedUser = db.prepare(
      'SELECT id, username, email, profileImage, bio, role FROM users WHERE id = ?'
    ).get(userId);
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer le compte (protégé)
router.delete('/profile', auth, (req, res) => {
  try {
    const userId = req.userId;
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;