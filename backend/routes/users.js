const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Route users fonctionne' });
});

// ✅ Obtenir le profil d'un utilisateur
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, "profileImage", bio, role, "createdAt" FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Mettre à jour le profil
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, bio, currentPassword, newPassword } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const user = userResult.rows[0];

    // Vérifier email déjà pris
    if (email && email !== user.email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existing.rows.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier mot de passe
    let hashedPassword = user.password;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Mot de passe actuel requis' });
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    await pool.query(
      `UPDATE users SET 
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        bio = COALESCE($3, bio),
        password = $4
       WHERE id = $5`,
      [username || null, email || null, bio || null, hashedPassword, userId]
    );

    const updated = await pool.query(
      'SELECT id, username, email, "profileImage", bio, role FROM users WHERE id = $1',
      [userId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer le compte
router.delete('/profile', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.userId]);
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;