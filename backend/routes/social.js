const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// ==================== LIKES ====================

// Liker ou unliker une recette
router.post('/recipes/:recipeId/like', auth, (req, res) => {
  const { recipeId } = req.params;
  const userId = req.userId;

  db.get('SELECT * FROM favorites WHERE userId = ? AND recipeId = ?', [userId, recipeId], (err, row) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (row) {
      db.run('DELETE FROM favorites WHERE userId = ? AND recipeId = ?', [userId, recipeId], function(err) {
        if (err) {
          console.error('Erreur DB:', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
        
        db.run('UPDATE recipes SET likes = likes - 1 WHERE id = ?', [recipeId]);
        res.json({ liked: false, message: 'Like retiré' });
      });
    } else {
      db.run('INSERT INTO favorites (userId, recipeId) VALUES (?, ?)', [userId, recipeId], function(err) {
        if (err) {
          console.error('Erreur DB:', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
        
        db.run('UPDATE recipes SET likes = likes + 1 WHERE id = ?', [recipeId]);
        res.json({ liked: true, message: 'Like ajouté' });
      });
    }
  });
});

// Vérifier si l'utilisateur a liké une recette
router.get('/recipes/:recipeId/like/check', auth, (req, res) => {
  const { recipeId } = req.params;
  const userId = req.userId;

  db.get('SELECT * FROM favorites WHERE userId = ? AND recipeId = ?', [userId, recipeId], (err, row) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ liked: !!row });
  });
});

// ==================== COMMENTAIRES ====================

// Ajouter un commentaire avec note
router.post('/recipes/:recipeId/comments', auth, (req, res) => {
  const { recipeId } = req.params;
  const userId = req.userId;
  const { content, rating } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Le commentaire est requis' });
  }

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
  }

  db.run(
    'INSERT INTO comments (content, userId, recipeId, rating) VALUES (?, ?, ?, ?)',
    [content, userId, recipeId, rating || null],
    function(err) {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      db.get(
        `SELECT c.*, u.username, u.profileImage 
         FROM comments c
         JOIN users u ON c.userId = u.id
         WHERE c.id = ?`,
        [this.lastID],
        (err, comment) => {
          if (err) {
            console.error('Erreur DB:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
          }
          res.status(201).json(comment);
        }
      );
    }
  );
});

// Récupérer tous les commentaires d'une recette
router.get('/recipes/:recipeId/comments', (req, res) => {
  const { recipeId } = req.params;

  db.all(
    `SELECT c.*, u.username, u.profileImage 
     FROM comments c
     JOIN users u ON c.userId = u.id
     WHERE c.recipeId = ?
     ORDER BY c.createdAt DESC`,
    [recipeId],
    (err, rows) => {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(rows);
    }
  );
});

// Supprimer un commentaire
router.delete('/comments/:commentId', auth, (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json({ message: 'Commentaire supprimé' });
    });
  });
});

// Obtenir la note moyenne d'une recette
router.get('/recipes/:recipeId/rating', (req, res) => {
  const { recipeId } = req.params;

  db.get(
    'SELECT AVG(rating) as average, COUNT(*) as total FROM comments WHERE recipeId = ? AND rating IS NOT NULL',
    [recipeId],
    (err, row) => {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json({
        average: row.average ? Math.round(row.average * 10) / 10 : 0,
        total: row.total || 0
      });
    }
  );
});

module.exports = router;