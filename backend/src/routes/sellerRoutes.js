const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Event = require('../models/Event');
const Seller = require('../models/Seller');
const Review = require('../models/Review');
const User = require('../models/User');

// ВАЖНО: /profile должен быть перед /:id

// Получить профиль ТЕКУЩЕГО продавца
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    res.json(seller);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Обновить профиль продавца
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    const { companyName, description, phone, address, inn, ogrn, website, email } = req.body;
    await seller.update({ companyName, description, phone, address, inn, ogrn, website, email });
    res.json(seller);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Получить все события продавца
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    const events = await Event.findAll({ 
      where: { sellerId: seller.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(events);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Создать событие
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    const event = await Event.create({ ...req.body, sellerId: seller.id });
    res.status(201).json(event);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Публичный маршрут - получить продавца по ID (должен быть после /profile и /events)
router.get('/:id', async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id, {
      attributes: ['id', 'companyName', 'description', 'phone', 'address', 'website', 'email', 'rating', 'reviewCount']
    });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    res.json(seller);
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// Публичный маршрут - получить события продавца
router.get('/:id/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { sellerId: req.params.id, moderationStatus: 'approved', isPublished: true },
      order: [['rating', 'DESC']],
      limit: 10
    });
    res.json(events);
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// Обновить событие
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: seller.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update(req.body);
    res.json(event);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Удалить событие
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Продавец не найден' });
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: seller.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
