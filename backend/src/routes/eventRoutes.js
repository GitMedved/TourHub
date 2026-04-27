const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const Event = require('../models/Event');
const Seller = require('../models/Seller');

// Публичные маршруты
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Создание события (только авторизованные)
router.post('/', authMiddleware, createEvent);

// Получить события продавца (ВСЕ, включая неопубликованные)
router.get('/seller/my', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller not found' });
    
    const events = await Event.findAll({
      where: { sellerId: seller.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ content: events, totalElements: events.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить событие
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller not found' });
    
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: seller.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить событие
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller not found' });
    
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: seller.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
