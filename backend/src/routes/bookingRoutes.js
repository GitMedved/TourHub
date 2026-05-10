const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Booking, Event, User, Seller, Review } = require('../models');

// Получить бронирования пользователя
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Review, as: 'review' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ content: bookings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить бронирования продавца
router.get('/seller', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    
    const bookings = await Booking.findAll({
      where: { sellerId: seller.id },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Review, as: 'review' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать бронирование
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, participants, contactName, contactPhone, contactEmail, specialRequests, eventDate } = req.body;
    const normalizedParticipants = Number(participants);

    if (!eventId || !Number.isInteger(normalizedParticipants) || normalizedParticipants < 1 || !eventDate) {
      return res.status(400).json({ error: 'eventId, participants and eventDate are required' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const booking = await Booking.create({
      eventId,
      userId: req.user.id,
      sellerId: event.sellerId,
      participants: normalizedParticipants,
      contactName: contactName?.trim(),
      contactPhone: contactPhone?.trim(),
      contactEmail: contactEmail?.trim().toLowerCase(),
      specialRequests: specialRequests?.trim(),
      eventDate,
      totalPrice: parseFloat(event.price) * normalizedParticipants,
      bookingNumber: 'BKG' + Date.now() + Math.floor(Math.random() * 1000),
      status: 'CREATED',
      paymentStatus: 'UNPAID'
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отменить бронирование
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    const isOwner = booking.userId === req.user.id;
    const isSeller = seller && booking.sellerId === seller.id;

    if (!isOwner && !isSeller) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'COMPLETED' || booking.status?.startsWith('CANCELLED')) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }
    
    booking.status = isSeller ? 'CANCELLED_BY_SELLER' : 'CANCELLED_BY_USER';
    booking.cancellationReason = (req.body.reason || req.body.cancelReason || '').trim();
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Завершить бронирование
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status?.startsWith('CANCELLED')) {
      return res.status(400).json({ error: 'Cancelled booking cannot be completed' });
    }
    
    booking.status = 'COMPLETED';
    booking.completedAt = new Date();
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Оставить отзыв
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { eventRating, sellerRating, comment } = req.body;
    
    const existingReview = await Review.findOne({ where: { bookingId: booking.id } });
    if (existingReview) {
      return res.status(400).json({ error: 'Отзыв уже оставлен' });
    }
    
    const review = await Review.create({
      eventId: booking.eventId,
      sellerId: booking.sellerId,
      userId: req.user.id,
      bookingId: booking.id,
      eventRating,
      sellerRating,
      comment,
      isApproved: false
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
