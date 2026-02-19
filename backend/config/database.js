const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/recipes.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données SQLite');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
   // Table des utilisateurs
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profileImage TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Table des recettes
    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        ingredients TEXT NOT NULL,
        steps TEXT NOT NULL,
        prepTime INTEGER,
        difficulty TEXT CHECK(difficulty IN ('Facile', 'Moyen', 'Difficile')),
        category TEXT,
        imageUrl TEXT,
        authorId INTEGER,
        tags TEXT,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Table des favoris (likes)
db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    userId INTEGER,
    recipeId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
  )
`);

// Table des commentaires avec notation
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    userId INTEGER,
    recipeId INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
  )
`);

    console.log('Tables créées avec succès');
  });
}

module.exports = db;