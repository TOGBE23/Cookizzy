const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// ==================== LIKES ====================

// ✅ Liker ou unliker une recette
router.post('/recipes/:recipeId/like', auth, (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    const existing = db.prepare('SELECT * FROM favorites WHERE userId = ? AND recipeId = ?').get(userId, recipeId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE userId = ? AND recipeId = ?').run(userId, recipeId);
      db.prepare('UPDATE recipes SET likes = likes - 1 WHERE id = ?').run(recipeId);
      res.json({ liked: false, message: 'Like retiré' });
    } else {
      db.prepare('INSERT INTO favorites (userId, recipeId) VALUES (?, ?)').run(userId, recipeId);
      db.prepare('UPDATE recipes SET likes = likes + 1 WHERE id = ?').run(recipeId);
      res.json({ liked: true, message: 'Like ajouté' });
    }
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Vérifier si l'utilisateur a liké une recette
router.get('/recipes/:recipeId/like/check', auth, (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;
    const row = db.prepare('SELECT * FROM favorites WHERE userId = ? AND recipeId = ?').get(userId, recipeId);
    res.json({ liked: !!row });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== COMMENTAIRES ====================

// ✅ Ajouter un commentaire avec note
router.post('/recipes/:recipeId/comments', auth, (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;
    const { content, rating } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Le commentaire est requis' });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
    }

    const result = db.prepare(
      'INSERT INTO comments (content, userId, recipeId, rating) VALUES (?, ?, ?, ?)'
    ).run(content, userId, recipeId, rating || null);

    const comment = db.prepare(
      `SELECT c.*, u.username, u.profileImage FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(comment);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Récupérer tous les commentaires d'une recette
router.get('/recipes/:recipeId/comments', (req, res) => {
  try {
    const { recipeId } = req.params;
    const rows = db.prepare(
      `SELECT c.*, u.username, u.profileImage FROM comments c JOIN users u ON c.userId = u.id WHERE c.recipeId = ? ORDER BY c.createdAt DESC`
    ).all(recipeId);
    res.json(rows);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer un commentaire
router.delete('/comments/:commentId', auth, (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (comment.userId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir la note moyenne d'une recette
router.get('/recipes/:recipeId/rating', (req, res) => {
  try {
    const { recipeId } = req.params;
    const row = db.prepare(
      'SELECT AVG(rating) as average, COUNT(*) as total FROM comments WHERE recipeId = ? AND rating IS NOT NULL'
    ).get(recipeId);
    res.json({
      average: row.average ? Math.round(row.average * 10) / 10 : 0,
      total: row.total || 0
    });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;