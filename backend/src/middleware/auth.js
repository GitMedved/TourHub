const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Please authenticate' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded user id:', decoded.id);
    
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return res.status(401).json({ error: 'Please authenticate' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = { authMiddleware };
