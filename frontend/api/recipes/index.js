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

  // Parser le body JSON manuellement pour Vercel serverless
if (req.method === 'POST' && !req.body) {
  await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { req.body = JSON.parse(data); } catch { req.body = {}; }
      resolve();
    });
    req.on('error', reject);
  });
}

  // GET toutes les recettes
  if (req.method === 'GET') {
    try {
      const result = await getPool().query('SELECT * FROM recipes ORDER BY "createdAt" DESC');
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
  }

  // POST ajouter une recette
  if (req.method === 'POST') {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    try {
      const { title, description, ingredients, steps, prepTime, difficulty, category, tags } = req.body;

      if (!title) return res.status(400).json({ message: 'Le titre est requis' });

      const result = await getPool().query(
        `INSERT INTO recipes (title, description, ingredients, steps, "prepTime", difficulty, category, "authorId", tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          title, description,
          JSON.stringify(ingredients || []),
          JSON.stringify(steps || []),
          prepTime, difficulty, category, user.id,
          JSON.stringify(tags || [])
        ]
      );

      const recipe = result.rows[0];
      return res.status(201).json({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        tags: recipe.tags ? JSON.parse(recipe.tags) : []
      });
    } catch (err) {
      console.error('Erreur:', err);
      return res.status(500).json({ message: 'Erreur serveur: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};