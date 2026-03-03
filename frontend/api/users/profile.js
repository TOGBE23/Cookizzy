const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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

    // GET profil
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT id, username, email, "profileImage", bio, role FROM users WHERE id = $1',
        [decoded.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      return res.status(200).json(result.rows[0]);
    }

    // PUT modifier profil
    if (req.method === 'PUT') {
      const { username, email, bio, currentPassword, newPassword } = req.body;

      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      if (userResult.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      const user = userResult.rows[0];

      let hashedPassword = user.password;
      if (newPassword) {
        if (!currentPassword) return res.status(400).json({ message: 'Mot de passe actuel requis' });
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      await pool.query(
        `UPDATE users SET username=COALESCE($1,username), email=COALESCE($2,email), bio=COALESCE($3,bio), password=$4 WHERE id=$5`,
        [username || null, email || null, bio || null, hashedPassword, decoded.id]
      );

      const updated = await pool.query(
        'SELECT id, username, email, "profileImage", bio, role FROM users WHERE id = $1',
        [decoded.id]
      );
      return res.status(200).json(updated.rows[0]);
    }

    // DELETE supprimer compte
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM users WHERE id = $1', [decoded.id]);
      return res.status(200).json({ message: 'Compte supprimé' });
    }

  } catch (err) {
    console.error('Erreur:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};