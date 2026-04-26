const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Создать бронирование
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, participants, contactName, contactPhone, contactEmail, specialRequests, eventDate } = req.body;
    
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const totalPrice = parseFloat(event.price) * parseInt(participants);
    const bookingNumber = `BKG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const booking = await Booking.create({
      bookingNumber,
      eventId,
      userId: req.user.id,
      participants: parseInt(participants),
      totalPrice,
      contactName,
      contactPhone,
      contactEmail,
      specialRequests,
      eventDate,
      status: 'CREATED'
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить мои бронирования
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, attributes: ['id', 'title', 'address', 'price', 'previewImage'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ content: bookings });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить бронирование по ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Event, attributes: ['id', 'title', 'address', 'price', 'previewImage'] }]
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отменить бронирование
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    await booking.update({ 
      status: 'CANCELLED', 
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || 'User cancelled'
    });
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
