const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/recipes.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
try {
  db = new Database(dbPath);
  console.log('✅ Connecté à la base de données SQLite');
} catch (err) {
  console.error('❌ Erreur:', err);
  process.exit(1);
}

db.pragma('foreign_keys = ON');
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, profileImage TEXT, bio TEXT, role TEXT DEFAULT 'user', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);
db.exec(`CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, ingredients TEXT NOT NULL, steps TEXT NOT NULL, prepTime INTEGER, difficulty TEXT, category TEXT, imageUrl TEXT, authorId INTEGER, tags TEXT, likes INTEGER DEFAULT 0, views INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE)`);
db.exec(`CREATE TABLE IF NOT EXISTS favorites (userId INTEGER, recipeId INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (userId, recipeId), FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE)`);
db.exec(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, userId INTEGER, recipeId INTEGER, rating INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE)`);
console.log('✅ Tables créées');

module.exports = db;