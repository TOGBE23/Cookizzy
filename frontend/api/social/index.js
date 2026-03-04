const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

let pool;
const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

const setHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const getUser = (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  setHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, recipeId, commentId } = req.query;

  // LIKES
  if (action === 'like' && recipeId) {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    if (req.method === 'POST') {
      try {
        const existing = await getPool().query(
          'SELECT * FROM favorites WHERE "userId" = $1 AND "recipeId" = $2',
          [user.id, recipeId]
        );

        if (existing.rows.length > 0) {
          await getPool().query('DELETE FROM favorites WHERE "userId" = $1 AND "recipeId" = $2', [user.id, recipeId]);
          await getPool().query('UPDATE recipes SET likes = likes - 1 WHERE id = $1', [recipeId]);
          return res.status(200).json({ liked: false });
        } else {
          await getPool().query('INSERT INTO favorites ("userId", "recipeId") VALUES ($1, $2)', [user.id, recipeId]);
          await getPool().query('UPDATE recipes SET likes = likes + 1 WHERE id = $1', [recipeId]);
          return res.status(200).json({ liked: true });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    }

    if (req.method === 'GET') {
      try {
        const result = await getPool().query(
          'SELECT * FROM favorites WHERE "userId" = $1 AND "recipeId" = $2',
          [user.id, recipeId]
        );
        return res.status(200).json({ liked: result.rows.length > 0 });
      } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    }
  }

  // COMMENTAIRES
  if (action === 'comments' && recipeId) {
    if (req.method === 'GET') {
      try {
        const result = await getPool().query(
          `SELECT c.*, u.username, u."profileImage" FROM comments c 
           JOIN users u ON c."userId" = u.id 
           WHERE c."recipeId" = $1 ORDER BY c."createdAt" DESC`,
          [recipeId]
        );
        return res.status(200).json(result.rows);
      } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    }

    if (req.method === 'POST') {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: 'Non autorisé' });

      try {
        const { content, rating } = req.body;
        if (!content) return res.status(400).json({ message: 'Commentaire requis' });

        const result = await getPool().query(
          'INSERT INTO comments (content, "userId", "recipeId", rating) VALUES ($1, $2, $3, $4) RETURNING id',
          [content, user.id, recipeId, rating || null]
        );

        const comment = await getPool().query(
          `SELECT c.*, u.username, u."profileImage" FROM comments c 
           JOIN users u ON c."userId" = u.id WHERE c.id = $1`,
          [result.rows[0].id]
        );
        return res.status(201).json(comment.rows[0]);
      } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    }
  }

  // SUPPRIMER COMMENTAIRE
  if (action === 'deleteComment' && commentId) {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    if (req.method === 'DELETE') {
      try {
        await getPool().query('DELETE FROM comments WHERE id = $1 AND "userId" = $2', [commentId, user.id]);
        return res.status(200).json({ message: 'Commentaire supprimé' });
      } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};