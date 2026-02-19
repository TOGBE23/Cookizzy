const jwt = require('jsonwebtoken');
const db = require('../config/database');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur depuis la base de données
    db.get('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      req.user = user;
      req.userId = user.id;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};