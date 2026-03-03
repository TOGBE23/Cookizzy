require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
    process.exit(1);
  }
  release();
  console.log('✅ Connecté à la base de données PostgreSQL (Supabase)');
});

module.exports = pool;