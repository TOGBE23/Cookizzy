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

module.exports = async (req, res) => {
  setHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Non autorisé' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = req.query.userId || decoded.id;

    const result = await getPool().query(
      'SELECT * FROM recipes WHERE "authorId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );

    const recipes = result.rows.map(row => ({
  ...row,
  ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : (row.ingredients || []),
  steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : (row.steps || []),
  tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])
}));

    return res.status(200).json(recipes);
  } catch (err) {
    console.error('Erreur:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};