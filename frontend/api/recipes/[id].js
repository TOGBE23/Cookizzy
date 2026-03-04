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

  const { id } = req.query;

  // GET une recette
  if (req.method === 'GET') {
    try {
      const result = await getPool().query('SELECT * FROM recipes WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
      
      const recipes = result.rows.map(row => ({
  ...row,
  ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : (row.ingredients || []),
  steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : (row.steps || []),
  tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])
}));
    } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // PUT modifier une recette
  if (req.method === 'PUT') {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    try {
      const { title, description, ingredients, steps, prepTime, difficulty, category, tags } = req.body;

      const existing = await getPool().query('SELECT "authorId" FROM recipes WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
      if (existing.rows[0].authorId !== user.id) return res.status(403).json({ message: 'Non autorisé' });

      await getPool().query(
        `UPDATE recipes SET title=$1, description=$2, ingredients=$3, steps=$4, "prepTime"=$5, difficulty=$6, category=$7, tags=$8 WHERE id=$9`,
        [title, description, JSON.stringify(ingredients), JSON.stringify(steps), prepTime, difficulty, category, JSON.stringify(tags || []), id]
      );

      const updated = await getPool().query('SELECT * FROM recipes WHERE id = $1', [id]);
      const row = updated.rows[0];
      return res.status(200).json({
        ...row,
        ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
        steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // DELETE supprimer une recette
  if (req.method === 'DELETE') {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    try {
      const existing = await getPool().query('SELECT "authorId" FROM recipes WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
      if (existing.rows[0].authorId !== user.id) return res.status(403).json({ message: 'Non autorisé' });

      await getPool().query('DELETE FROM recipes WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Recette supprimée' });
    } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};