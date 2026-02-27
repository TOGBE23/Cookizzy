const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration multer (stockage en mémoire pour Vercel)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    else cb(new Error('Seules les images sont autorisées'));
  }
});

// ✅ Obtenir toutes les recettes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY "createdAt" DESC');
    const recipes = result.rows.map(row => ({
      ...row,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    }));
    res.json(recipes);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir les recettes d'un utilisateur - AVANT /:id
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM recipes WHERE "authorId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );
    const recipes = result.rows.map(row => ({
      ...row,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    }));
    res.json(recipes);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir une recette par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
    
    const row = result.rows[0];
    const recipe = {
      ...row,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    };
    res.json(recipe);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Ajouter une recette
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, prepTime, difficulty, category } = req.body;
    const authorId = req.userId;
    // Note: sur Vercel les images ne sont pas persistantes, on ignore l'upload pour l'instant
    const imageUrl = null;

    let ingredients, steps, tags;
    try {
      ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
      steps = req.body.steps ? JSON.parse(req.body.steps) : [];
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      return res.status(400).json({ message: 'Format de données invalide' });
    }

    if (!title) return res.status(400).json({ message: 'Le titre est requis' });
    if (!ingredients.length) return res.status(400).json({ message: 'Les ingrédients sont requis' });
    if (!steps.length) return res.status(400).json({ message: 'Les étapes sont requises' });

    const result = await pool.query(
      `INSERT INTO recipes (title, description, ingredients, steps, "prepTime", difficulty, category, "authorId", tags, "imageUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [title, description, JSON.stringify(ingredients), JSON.stringify(steps), prepTime, difficulty, category, authorId, JSON.stringify(tags), imageUrl]
    );

    res.status(201).json({
      id: result.rows[0].id,
      title, description, ingredients, steps,
      prepTime, difficulty, category, authorId, tags, imageUrl
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ✅ Mettre à jour une recette
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prepTime, difficulty, category } = req.body;
    const userId = req.userId;

    let ingredients, steps, tags;
    try {
      ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
      steps = req.body.steps ? JSON.parse(req.body.steps) : [];
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      return res.status(400).json({ message: 'Format de données invalide' });
    }

    if (!title) return res.status(400).json({ message: 'Le titre est requis' });

    const existing = await pool.query('SELECT "authorId", "imageUrl" FROM recipes WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
    if (existing.rows[0].authorId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    await pool.query(
      `UPDATE recipes SET title=$1, description=$2, ingredients=$3, steps=$4, "prepTime"=$5, difficulty=$6, category=$7, tags=$8 WHERE id=$9`,
      [title, description, JSON.stringify(ingredients), JSON.stringify(steps), prepTime, difficulty, category, JSON.stringify(tags), id]
    );

    const updated = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    const row = updated.rows[0];
    res.json({
      ...row,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer une recette
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await pool.query('SELECT "authorId" FROM recipes WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Recette non trouvée' });
    if (existing.rows[0].authorId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ message: 'Recette supprimée avec succès' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;