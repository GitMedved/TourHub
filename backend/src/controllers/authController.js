const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const { firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      email, password, firstName, lastName, role: role || 'USER'
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    await user.update({ lastLogin: new Date() });

    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      avatar: req.user.avatar,
      phone: req.user.phone
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const socialAuth = async (req, res) => {
  try {
    const { provider, telegramId, email, firstName, lastName } = req.body;
    if (!provider || !['google', 'telegram'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    let user = null;
    if (provider === 'telegram' && telegramId) {
      user = await User.findOne({ where: { telegramId: String(telegramId) } });
    }
    if (!user && email) {
      user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    }

    if (!user) {
      user = await User.create({
        email: (email || `${provider}_${Date.now()}@tourhub.local`).trim().toLowerCase(),
        password: Math.random().toString(36).slice(2) + 'A1!',
        firstName: firstName || 'Social',
        lastName: lastName || 'User',
        role: 'USER',
        authProvider: provider,
        telegramId: provider === 'telegram' ? String(telegramId || '') : null
      });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, socialAuth };
