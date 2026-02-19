const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Augmenté à 20MB
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

// Obtenir toutes les recettes (public)
router.get('/', (req, res) => {
  db.all('SELECT * FROM recipes ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    
    try {
      const recipes = rows.map(row => ({
        ...row,
        ingredients: JSON.parse(row.ingredients),
        steps: JSON.parse(row.steps),
        tags: row.tags ? JSON.parse(row.tags) : []
      }));
      res.json(recipes);
    } catch (parseErr) {
      console.error('Erreur de parsing:', parseErr);
      res.status(500).json({ message: 'Erreur de format des données' });
    }
  });
});

// Obtenir une recette par ID (public)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }
    
    try {
      const recipe = {
        ...row,
        ingredients: JSON.parse(row.ingredients),
        steps: JSON.parse(row.steps),
        tags: row.tags ? JSON.parse(row.tags) : []
      };
      res.json(recipe);
    } catch (parseErr) {
      console.error('Erreur de parsing:', parseErr);
      res.status(500).json({ message: 'Erreur de format des données' });
    }
  });
});

// Ajouter une recette avec image (protégé)
router.post('/', auth, upload.single('image'), (req, res) => {
  console.log('Données reçues - body:', req.body);
  console.log('Fichier reçu - file:', req.file);
  
  const { title, description, prepTime, difficulty, category } = req.body;
  const authorId = req.userId;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  let ingredients, steps, tags;

  try {
    ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
    steps = req.body.steps ? JSON.parse(req.body.steps) : [];
    tags = req.body.tags ? JSON.parse(req.body.tags) : [];
  } catch (parseErr) {
    console.error('Erreur de parsing JSON:', parseErr);
    return res.status(400).json({ message: 'Format de données invalide' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Le titre est requis' });
  }
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Les ingrédients sont requis' });
  }
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ message: 'Les étapes sont requises' });
  }

  const ingredientsJSON = JSON.stringify(ingredients);
  const stepsJSON = JSON.stringify(steps);
  const tagsJSON = JSON.stringify(tags);

  db.run(
    `INSERT INTO recipes (title, description, ingredients, steps, prepTime, difficulty, category, authorId, tags, imageUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, ingredientsJSON, stepsJSON, prepTime, difficulty, category, authorId, tagsJSON, imageUrl],
    function(err) {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur lors de la création: ' + err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        title,
        description,
        ingredients,
        steps,
        prepTime,
        difficulty,
        category,
        authorId,
        tags,
        imageUrl
      });
    }
  );
});

// Mettre à jour une recette avec image (protégé)
router.put('/:id', auth, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, description, prepTime, difficulty, category, removeImage } = req.body;
  const userId = req.userId;
  
  console.log('Mise à jour - ID:', id);
  console.log('Données reçues - body:', req.body);
  console.log('Fichier reçu - file:', req.file);
  console.log('Remove image:', removeImage);

  let ingredients, steps, tags;

  try {
    ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
    steps = req.body.steps ? JSON.parse(req.body.steps) : [];
    tags = req.body.tags ? JSON.parse(req.body.tags) : [];
  } catch (parseErr) {
    console.error('Erreur de parsing JSON:', parseErr);
    return res.status(400).json({ message: 'Format de données invalide' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Le titre est requis' });
  }

  db.get('SELECT authorId, imageUrl FROM recipes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }
    if (row.authorId !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Nouvelle image:', imageUrl);
    } else if (removeImage === 'true') {
      imageUrl = null;
      console.log('Image supprimée');
    } else {
      imageUrl = row.imageUrl;
      console.log('Image conservée:', imageUrl);
    }

    const ingredientsJSON = JSON.stringify(ingredients);
    const stepsJSON = JSON.stringify(steps);
    const tagsJSON = JSON.stringify(tags);

    db.run(
      `UPDATE recipes 
       SET title = ?, description = ?, ingredients = ?, steps = ?, 
           prepTime = ?, difficulty = ?, category = ?, tags = ?, imageUrl = ?
       WHERE id = ?`,
      [title, description, ingredientsJSON, stepsJSON, prepTime, difficulty, category, tagsJSON, imageUrl, id],
      function(err) {
        if (err) {
          console.error('Erreur DB:', err);
          return res.status(500).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
        }
        
        db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, updatedRow) => {
          if (err) {
            return res.json({ message: 'Recette mise à jour avec succès' });
          }
          
          try {
            const recipe = {
              ...updatedRow,
              ingredients: JSON.parse(updatedRow.ingredients),
              steps: JSON.parse(updatedRow.steps),
              tags: updatedRow.tags ? JSON.parse(updatedRow.tags) : []
            };
            res.json(recipe);
          } catch (parseErr) {
            res.json({ message: 'Recette mise à jour avec succès' });
          }
        });
      }
    );
  });
});

// Supprimer une recette (protégé)
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  db.get('SELECT authorId FROM recipes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }
    if (row.authorId !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    db.run('DELETE FROM recipes WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression' });
      }
      res.json({ message: 'Recette supprimée avec succès' });
    });
  });
});

// Obtenir les recettes d'un utilisateur (protégé)
router.get('/user/:userId', auth, (req, res) => {
  const { userId } = req.params;
  
  db.all('SELECT * FROM recipes WHERE authorId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    
    try {
      const recipes = rows.map(row => {
        try {
          return {
            ...row,
            ingredients: JSON.parse(row.ingredients),
            steps: JSON.parse(row.steps),
            tags: row.tags ? JSON.parse(row.tags) : []
          };
        } catch (parseErr) {
          console.log('Erreur parsing pour recette ID:', row.id);
          return {
            ...row,
            ingredients: [],
            steps: [],
            tags: []
          };
        }
      });
      res.json(recipes);
    } catch (parseErr) {
      console.error('Erreur de parsing:', parseErr);
      res.status(500).json({ message: 'Erreur de format des données' });
    }
  });
});

module.exports = router;