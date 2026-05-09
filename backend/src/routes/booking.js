const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Review = require('../models/Review');
const { Op } = require('sequelize');

// Get user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Review, as: 'review' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const bookingsWithReviewFlag = bookings.map(booking => ({
      ...booking.toJSON(),
      hasReview: !!booking.review
    }));

    res.json(bookingsWithReviewFlag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's bookingsrouter.get('/seller', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Только для продавцов' });
    }

    const bookings = await Booking.findAll({
      where: { sellerId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: require('../models/User'), as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete booking (user marks as completed)
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Это не ваше бронирование' });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Можно завершить только подтвержденное бронирование' });
    }

    booking.status = 'COMPLETED';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    // Allow user or seller to cancel
    if (booking.userId !== req.user.id && booking.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для отмены' });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Нельзя отменить это бронирование' });
    }

    booking.status = 'CANCELLED';
    booking.cancelReason = req.body.cancelReason || 'Отменено пользователем';
    await booking.save();

    // Restore event capacity
    const event = await Event.findByPk(booking.eventId);
    if (event) {
      event.capacity += booking.persons;
      await event.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
