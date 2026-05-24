const express = require('express');
const router = express.Router();
const { register, login, getMe, socialAuth } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/social', socialAuth);

module.exports = router;
