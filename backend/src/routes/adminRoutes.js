const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');
const Seller = require('../models/Seller');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// ========== ПРОДАВЦЫ ==========
router.get('/sellers', authMiddleware, async (req, res) => {
  try {
    const sellers = await Seller.findAll({ include: [{ model: User, attributes: ['email', 'firstName', 'lastName'] }] });
    res.json(sellers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/sellers/:id/approve', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Not found' });
    seller.moderationStatus = 'approved'; seller.approved = true;
    await seller.save();
    res.json(seller);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/sellers/:id/reject', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Not found' });
    seller.moderationStatus = 'rejected'; seller.approved = false;
    await seller.save();
    res.json(seller);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ========== СОБЫТИЯ ==========
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = await Event.findAll({ include: [{ model: Seller, attributes: ['companyName'] }] });
    res.json(events);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Обновить событие (модерация + редактирование)
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const allowedFields = [
      'title', 'shortDescription', 'fullDescription', 'price', 'priceInfo',
      'address', 'region', 'latitude', 'longitude', 'startDate', 'endDate',
      'durationDays', 'maxParticipants', 'category', 'season',
      'moderationStatus', 'isPublished', 'publishUntil', 'moderationComment'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    // При одобрении — публикуем
    if (updates.moderationStatus === 'approved') {
      updates.isPublished = true;
    }
    if (updates.moderationStatus === 'rejected') {
      updates.isPublished = false;
    }
    
    await event.update(updates);
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:id/approve', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    await event.update({ moderationStatus: 'approved', isPublished: true, publishUntil: req.body.publishUntil || null });
    res.json(event);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/events/:id/reject', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    await event.update({ moderationStatus: 'rejected', isPublished: false, moderationComment: req.body.reason });
    res.json(event);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ========== БРОНИРОВАНИЯ ==========
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'email'] },
        { model: Event, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/bookings/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    await booking.update({ status: 'CONFIRMED', confirmedAt: new Date() });
    res.json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/bookings/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    await booking.update({ status: 'COMPLETED', completedAt: new Date() });
    res.json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
