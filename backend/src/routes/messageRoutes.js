const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');
const Message = require('../models/Message');
const User = require('../models/User');
const Event = require('../models/Event');
const Seller = require('../models/Seller');
const sequelize = require('../config/database');

// ========== ЧАТ С МЕНЕДЖЕРОМ ==========

// Отправить сообщение менеджеру
router.post('/to-manager', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const newMessage = await Message.create({
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fromUserRole: req.user.role,
      toUserId: null,
      toUserName: 'Менеджер',
      message: message.trim(),
      conversationId: `user_${req.user.id}_manager`
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить историю чата
router.get('/chat/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.userId) && req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = await Message.findAll({
      where: {
        conversationId: `user_${req.params.userId}_manager`
      },
      order: [['createdAt', 'ASC']]
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все чаты для менеджера
router.get('/admin/chats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Получаем все уникальные conversationId с последним сообщением
    const chats = await Message.findAll({
      attributes: [
        'conversationId',
        'fromUserName',
        'fromUserId',
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageAt'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount']
      ],
      where: {
        conversationId: { [Op.like]: 'user_%_manager' }
      },
      group: ['conversationId', 'fromUserName', 'fromUserId'],
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']],
      raw: true
    });
    
    res.json(chats);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ответить в чате (менеджер)
router.post('/admin/chat/reply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { conversationId, message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const reply = await Message.create({
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fromUserRole: 'MANAGER',
      toUserId: null,
      toUserName: 'Пользователь',
      message: message.trim(),
      conversationId
    });
    
    res.status(201).json(reply);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== СООБЩЕНИЯ ПРОДАВЦУ ==========

router.post('/to-seller', authMiddleware, async (req, res) => {
  try {
    const { sellerId, message, eventId } = req.body;
    
    const seller = await User.findByPk(sellerId);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    
    const event = eventId ? await Event.findByPk(eventId) : null;
    
    const newMessage = await Message.create({
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      toUserId: sellerId,
      toUserName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email,
      message: message.trim(),
      eventId: eventId || null,
      eventTitle: event?.title || null,
      conversationId: `seller_${sellerId}_user_${req.user.id}`
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/seller/messages', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = await Message.findAll({
      where: { toUserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ЧАТ ПО БРОНИРОВАНИЮ (юзер-селлер) ==========

// Получить сообщения по бронированию
router.get('/booking/:bookingId', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByPk(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    // Проверяем доступ
    const sellerProfile = await Seller.findOne({ where: { userId: req.user.id } });
    const isUser = booking.userId === req.user.id;
    const isSeller = sellerProfile?.id === booking.sellerId;
    const isManager = ['MANAGER', 'ADMIN'].includes(req.user.role);
    
    if (!isUser && !isSeller && !isManager) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    const conversationId = `booking_${req.params.bookingId}`;
    
    let messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']]
    });
    
    // Если сообщений нет, создаем приветственное
    if (messages.length === 0) {
      messages = [];
    }
    
    res.json({
      booking: {
        id: booking.id,
        eventTitle: booking.eventTitle || `Бронирование #${booking.id}`,
        status: booking.status
      },
      messages: messages
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправить сообщение по бронированию
router.post('/booking/:bookingId', authMiddleware, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByPk(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    const sellerProfile = await Seller.findOne({ where: { userId: req.user.id } });
    const bookingSeller = await Seller.findByPk(booking.sellerId);
    const isUser = booking.userId === req.user.id;
    const isSeller = sellerProfile?.id === booking.sellerId;
    
    if (!isUser && !isSeller) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    const message = req.body.text || req.body.message;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Текст обязателен' });
    }
    
    const conversationId = `booking_${req.params.bookingId}`;
    
    const newMessage = await Message.create({
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fromUserRole: req.user.role,
      toUserId: isUser ? bookingSeller?.userId : booking.userId,
      toUserName: isUser ? 'Продавец' : 'Покупатель',
      message: message.trim(),
      conversationId
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
