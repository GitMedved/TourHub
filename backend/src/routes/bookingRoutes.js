const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const Review = require('../models/Review');
const { Op } = require('sequelize');

const CANCEL_REASONS = [
  'Планы изменились',
  'Нашёл более выгодное предложение',
  'Не подходит дата',
  'Проблемы со здоровьем',
  'Финансовые трудности',
  'Не устроили условия',
  'Другое'
];

// Создать бронирование
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, participants, contactName, contactPhone, contactEmail, specialRequests, eventDate } = req.body;
    
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const totalPrice = parseFloat(event.price) * parseInt(participants);
    const bookingNumber = `BKG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const booking = await Booking.create({
      bookingNumber, eventId, userId: req.user.id,
      participants: parseInt(participants), totalPrice,
      contactName, contactPhone, contactEmail,
      specialRequests, eventDate, status: 'CREATED'
    });
    
    res.status(201).json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Мои бронирования (юзер)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, attributes: ['id', 'title', 'address', 'price', 'previewImage', 'sellerId'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ content: bookings });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Бронирования продавца (раздел Продажи)
router.get('/seller', authMiddleware, async (req, res) => {
  try {
    const Seller = require('../models/Seller');
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller not found' });
    
    const events = await Event.findAll({ where: { sellerId: seller.id }, attributes: ['id'] });
    const eventIds = events.map(e => e.id);
    
    const bookings = await Booking.findAll({
      where: { eventId: { [Op.in]: eventIds } },
      include: [
        { model: Event, attributes: ['id', 'title', 'price'] },
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ content: bookings });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Отменить бронирование (юзер)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    
    await booking.update({ 
      status: 'CANCELLED_BY_USER', 
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || 'Отменено пользователем'
    });
    res.json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Отменить бронирование (продавец)
router.put('/:id/cancel-seller', authMiddleware, async (req, res) => {
  try {
    const Seller = require('../models/Seller');
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller not found' });
    
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Event, where: { sellerId: seller.id } }]
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    await booking.update({ 
      status: 'CANCELLED_BY_SELLER', 
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || 'Отменено продавцом'
    });
    res.json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Завершить бронирование (юзер)
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    
    await booking.update({ status: 'COMPLETED', completedAt: new Date() });
    res.json(booking);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Получить причины отмены
router.get('/cancel-reasons', authMiddleware, (req, res) => {
  res.json(CANCEL_REASONS);
});

// Создать отзыв
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Event }]
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Бронирование не завершено' });
    
    const { eventRating, sellerRating, comment } = req.body;
    if (!eventRating || eventRating < 1 || eventRating > 5 || !sellerRating || sellerRating < 1 || sellerRating > 5) return res.status(400).json({ error: 'Рейтинг от 1 до 5' });
    
    const review = await Review.create({
      eventRating, sellerRating, comment,
      userId: req.user.id,
      eventId: booking.eventId,
      sellerId: booking.Event.sellerId,
      bookingId: booking.id
    });
    
    res.status(201).json(review);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
