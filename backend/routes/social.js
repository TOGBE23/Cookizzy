const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// ==================== LIKES ====================

// ✅ Liker ou unliker une recette
router.post('/recipes/:recipeId/like', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    const existing = await pool.query(
      'SELECT * FROM favorites WHERE "userId" = $1 AND "recipeId" = $2',
      [userId, recipeId]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE "userId" = $1 AND "recipeId" = $2', [userId, recipeId]);
      await pool.query('UPDATE recipes SET likes = likes - 1 WHERE id = $1', [recipeId]);
      res.json({ liked: false, message: 'Like retiré' });
    } else {
      await pool.query('INSERT INTO favorites ("userId", "recipeId") VALUES ($1, $2)', [userId, recipeId]);
      await pool.query('UPDATE recipes SET likes = likes + 1 WHERE id = $1', [recipeId]);
      res.json({ liked: true, message: 'Like ajouté' });
    }
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Vérifier si l'utilisateur a liké
router.get('/recipes/:recipeId/like/check', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;
    const result = await pool.query(
      'SELECT * FROM favorites WHERE "userId" = $1 AND "recipeId" = $2',
      [userId, recipeId]
    );
    res.json({ liked: result.rows.length > 0 });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== COMMENTAIRES ====================

// ✅ Ajouter un commentaire
router.post('/recipes/:recipeId/comments', auth, async (req, res) => {
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

    const result = await pool.query(
      'INSERT INTO comments (content, "userId", "recipeId", rating) VALUES ($1, $2, $3, $4) RETURNING id',
      [content, userId, recipeId, rating || null]
    );

    const comment = await pool.query(
      `SELECT c.*, u.username, u."profileImage" FROM comments c JOIN users u ON c."userId" = u.id WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(comment.rows[0]);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Récupérer les commentaires d'une recette
router.get('/recipes/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.username, u."profileImage" FROM comments c JOIN users u ON c."userId" = u.id WHERE c."recipeId" = $1 ORDER BY c."createdAt" DESC`,
      [recipeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer un commentaire
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await pool.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (comment.rows.length === 0) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (comment.rows[0].userId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir la note moyenne
router.get('/recipes/:recipeId/rating', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating) as average, COUNT(*) as total FROM comments WHERE "recipeId" = $1 AND rating IS NOT NULL',
      [recipeId]
    );
    res.json({
      average: result.rows[0].average ? Math.round(result.rows[0].average * 10) / 10 : 0,
      total: parseInt(result.rows[0].total) || 0
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;