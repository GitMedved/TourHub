const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');

// Хранилище сообщений
let messages = [];

// Отправить сообщение продавцу
router.post('/to-seller', authMiddleware, async (req, res) => {
  try {
    const { sellerId, message, eventId } = req.body;
    
    // Находим продавца
    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    // Находим событие
    const event = await Event.findByPk(eventId);
    
    const newMessage = {
      id: Date.now(),
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName} ${req.user.lastName}`,
      toUserId: sellerId,
      toUserName: `${seller.firstName} ${seller.lastName}`,
      message,
      eventId,
      eventTitle: event?.title,
      createdAt: new Date(),
      read: false
    };
    
    messages.push(newMessage);
    console.log(`Сообщение от ${newMessage.fromUserName} продавцу ${newMessage.toUserName}: ${message}`);
    
    res.json({ success: true, message: 'Сообщение отправлено продавцу' });
  } catch (error) {
    console.error('Error sending message to seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить сообщения для продавца
router.get('/seller/messages', authMiddleware, async (req, res) => {
  try {
    // Проверяем, что пользователь - продавец
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const sellerMessages = messages.filter(m => m.toUserId === req.user.id);
    res.json(sellerMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отправить сообщение менеджеру
router.post('/to-manager', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    const newMessage = {
      id: Date.now(),
      fromUserId: req.user.id,
      fromUserName: `${req.user.firstName} ${req.user.lastName}`,
      toUserId: null,
      toUserName: 'Менеджер',
      message,
      createdAt: new Date(),
      reply: null
    };
    
    messages.push(newMessage);
    console.log(`Сообщение от пользователя ${newMessage.fromUserName}: ${message}`);
    
    res.json({ success: true, message: 'Сообщение отправлено менеджеру' });
  } catch (error) {
    console.error('Error sending message to manager:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить все сообщения (для менеджера)
router.get('/admin/messages', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Сообщения от пользователей (без toUserId)
    const userMessages = messages.filter(m => m.toUserId === null);
    res.json(userMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ответить на сообщение (для менеджера)
router.post('/admin/messages/reply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { messageId, reply } = req.body;
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      msg.reply = reply;
      msg.repliedAt = new Date();
      msg.repliedBy = `${req.user.firstName} ${req.user.lastName}`;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
