const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// Get messages for user-seller chat (only for CONFIRMED bookings)
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    // Check if user is participant
    if (req.user.id !== booking.userId && req.user.id !== booking.sellerId && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    // Only confirmed bookings can have chat
    if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Чат доступен только для подтвержденных бронирований' });
    }

    const messages = await Message.findAll({
      where: { bookingId: req.params.bookingId },
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message in booking chat
router.post('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Чат доступен только для подтвержденных бронирований' });
    }

    let senderRole, receiverId, receiverRole;

    if (req.user.role === 'user') {
      senderRole = 'user';
      receiverId = booking.sellerId;
      receiverRole = 'seller';
    } else if (req.user.role === 'seller') {
      if (req.user.id !== booking.sellerId) {
        return res.status(403).json({ error: 'Это не ваше бронирование' });
      }
      senderRole = 'seller';
      receiverId = booking.userId;
      receiverRole = 'user';
    } else {
      return res.status(400).json({ error: 'Только пользователь и продавец могут писать в этот чат' });
    }

    const message = await Message.create({
      text: req.body.text,
      senderId: req.user.id,
      senderRole,
      receiverId,
      receiverRole,
      bookingId: parseInt(req.params.bookingId),
      isRead: false
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all chats for seller
router.get('/seller', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Только для продавцов' });
    }

    const bookings = await Booking.findAll({
      where: {
        sellerId: req.user.id,
        status: { [Op.in]: ['CONFIRMED', 'COMPLETED'] }
      }
    });

    const bookingIds = bookings.map(b => b.id);

    const messages = await Message.findAll({
      where: { bookingId: { [Op.in]: bookingIds } },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
