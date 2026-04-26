const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');
const Seller = require('../models/Seller');

// Получить всех продавцов
router.get('/sellers', authMiddleware, async (req, res) => {
  try {
    const sellers = await Seller.findAll({
      include: [{ model: User, attributes: ['email', 'firstName', 'lastName'] }]
    });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Одобрить продавца
router.put('/sellers/:id/approve', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    seller.moderationStatus = 'approved';
    seller.approved = true;
    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отклонить продавца
router.put('/sellers/:id/reject', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    seller.moderationStatus = 'rejected';
    seller.approved = false;
    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все события
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Seller, attributes: ['companyName'] }]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Одобрить событие
router.post('/events/:id/approve', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.moderationStatus = 'approved';
    event.isPublished = true;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отклонить событие
router.post('/events/:id/reject', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.moderationStatus = 'rejected';
    event.isPublished = false;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить событие
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Одобрить событие (менеджер)
router.post('/events/:id/approve', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update({ moderationStatus: 'approved', isPublished: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отклонить событие
router.post('/events/:id/reject', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update({ moderationStatus: 'rejected', isPublished: false, moderationComment: req.body.reason });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все бронирования
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }, { model: Event, attributes: ['title'] }]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Подтвердить бронирование
router.post('/bookings/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.update({ status: 'CONFIRMED' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все бронирования для админа
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const User = require('../models/User');
    const Event = require('../models/Event');
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'email'] },
        { model: Event, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Подтвердить бронирование
router.post('/bookings/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.update({ status: 'CONFIRMED', confirmedAt: new Date() });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отметить как завершённое
router.post('/bookings/:id/complete', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.update({ status: 'COMPLETED', completedAt: new Date() });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
