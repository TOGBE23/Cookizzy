const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// S'assurer que le dossier uploads existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// ✅ Obtenir toutes les recettes (public)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM recipes ORDER BY createdAt DESC').all();
    const recipes = rows.map(row => ({
      ...row,
      ingredients: JSON.parse(row.ingredients),
      steps: JSON.parse(row.steps),
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    res.json(recipes);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir les recettes d'un utilisateur (protégé) - DOIT être avant /:id
router.get('/user/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const rows = db.prepare('SELECT * FROM recipes WHERE authorId = ? ORDER BY createdAt DESC').all(userId);
    const recipes = rows.map(row => {
      try {
        return {
          ...row,
          ingredients: JSON.parse(row.ingredients),
          steps: JSON.parse(row.steps),
          tags: row.tags ? JSON.parse(row.tags) : []
        };
      } catch (parseErr) {
        return { ...row, ingredients: [], steps: [], tags: [] };
      }
    });
    res.json(recipes);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir une recette par ID (public)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
    
    if (!row) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }
    
    const recipe = {
      ...row,
      ingredients: JSON.parse(row.ingredients),
      steps: JSON.parse(row.steps),
      tags: row.tags ? JSON.parse(row.tags) : []
    };
    res.json(recipe);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Ajouter une recette (protégé)
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    const { title, description, prepTime, difficulty, category } = req.body;
    const authorId = req.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let ingredients, steps, tags;
    try {
      ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
      steps = req.body.steps ? JSON.parse(req.body.steps) : [];
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (parseErr) {
      return res.status(400).json({ message: 'Format de données invalide' });
    }

    if (!title) return res.status(400).json({ message: 'Le titre est requis' });
    if (!ingredients.length) return res.status(400).json({ message: 'Les ingrédients sont requis' });
    if (!steps.length) return res.status(400).json({ message: 'Les étapes sont requises' });

    const result = db.prepare(
      `INSERT INTO recipes (title, description, ingredients, steps, prepTime, difficulty, category, authorId, tags, imageUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, description, JSON.stringify(ingredients), JSON.stringify(steps), prepTime, difficulty, category, authorId, JSON.stringify(tags), imageUrl);

    res.status(201).json({
      id: result.lastInsertRowid,
      title, description, ingredients, steps,
      prepTime, difficulty, category, authorId, tags, imageUrl
    });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ✅ Mettre à jour une recette (protégé)
router.put('/:id', auth, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prepTime, difficulty, category, removeImage } = req.body;
    const userId = req.userId;

    let ingredients, steps, tags;
    try {
      ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
      steps = req.body.steps ? JSON.parse(req.body.steps) : [];
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (parseErr) {
      return res.status(400).json({ message: 'Format de données invalide' });
    }

    if (!title) return res.status(400).json({ message: 'Le titre est requis' });

    const row = db.prepare('SELECT authorId, imageUrl FROM recipes WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ message: 'Recette non trouvée' });
    if (row.authorId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (removeImage === 'true') {
      imageUrl = null;
    } else {
      imageUrl = row.imageUrl;
    }

    db.prepare(
      `UPDATE recipes SET title=?, description=?, ingredients=?, steps=?, prepTime=?, difficulty=?, category=?, tags=?, imageUrl=? WHERE id=?`
    ).run(title, description, JSON.stringify(ingredients), JSON.stringify(steps), prepTime, difficulty, category, JSON.stringify(tags), imageUrl, id);

    const updatedRow = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
    const recipe = {
      ...updatedRow,
      ingredients: JSON.parse(updatedRow.ingredients),
      steps: JSON.parse(updatedRow.steps),
      tags: updatedRow.tags ? JSON.parse(updatedRow.tags) : []
    };
    res.json(recipe);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ✅ Supprimer une recette (protégé)
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const row = db.prepare('SELECT authorId FROM recipes WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ message: 'Recette non trouvée' });
    if (row.authorId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    res.json({ message: 'Recette supprimée avec succès' });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;