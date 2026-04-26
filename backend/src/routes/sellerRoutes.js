const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Event = require('../models/Event');

// Получить профиль продавца (временно возвращаем заглушку)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Временное решение - возвращаем базовый профиль
    res.json({
      id: req.user.id,
      companyName: req.user.companyName || 'Travel Agency',
      description: 'Professional travel agency',
      phone: '+7 (495) 123-45-67',
      address: 'Moscow, Tverskaya str., 1',
      approved: true,
      moderationStatus: 'approved'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все события продавца
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = await Event.findAll({ where: { sellerId: req.user.id } });
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать событие
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      sellerId: req.user.id
    };
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить событие
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить событие
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Опубликовать событие
router.post('/events/:id/publish', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update({ isPublished: true, moderationStatus: 'pending' });
    res.json(event);
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Отправить событие на модерацию
router.post('/events/:id/send-to-moderation', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update({ moderationStatus: 'pending', isPublished: false });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Установить обложку
router.put('/events/:id/cover', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update({ previewImage: req.body.previewImage });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
