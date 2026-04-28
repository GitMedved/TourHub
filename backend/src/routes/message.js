const express = require('express');
const router = express.Router();
const { Message, Booking, User, Event } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
        { model: Event, attributes: ['id', 'title'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    const isUser = booking.userId === userId;
    const isSeller = booking.sellerId === userId;
    const isManager = ['manager', 'admin'].includes(userRole);

    if (!isUser && !isSeller && !isManager) {
      return res.status(403).json({ error: 'Нет доступа к этому чату' });
    }

    const messages = await Message.findAll({
      where: { bookingId: parseInt(bookingId) },
      order: [['created_at', 'ASC']],
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'email', 'role'] 
        }
      ]
    });

    if (isUser || isSeller) {
      await Message.update(
        { read: true },
        {
          where: {
            bookingId: parseInt(bookingId),
            receiverId: userId,
            read: false
          }
        }
      );
    }

    res.json({
      booking: {
        id: booking.id,
        eventTitle: booking.Event?.title,
        status: booking.status,
        dates: booking.dates
      },
      participant: isUser ? booking.seller : booking.user,
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Ошибка загрузки сообщений' });
  }
});

router.post('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Текст сообщения не может быть пустым' });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: User, as: 'user', attributes: ['id'] },
        { model: User, as: 'seller', attributes: ['id'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(403).json({ 
        error: 'Чат доступен только после подтверждения бронирования менеджером' 
      });
    }

    const isUser = booking.userId === userId;
    const isSeller = booking.sellerId === userId;

    if (!isUser && !isSeller) {
      return res.status(403).json({ error: 'Нет доступа к этому чату' });
    }

    const receiverId = isUser ? booking.sellerId : booking.userId;

    const message = await Message.create({
      text: text.trim(),
      senderId: userId,
      receiverId: receiverId,
      bookingId: parseInt(bookingId),
      read: false
    });

    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] }
      ]
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

router.get('/my-chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereCondition = {};
    
    if (userRole === 'user') {
      whereCondition = { userId: userId };
    } else if (userRole === 'seller') {
      whereCondition = { sellerId: userId };
    } else {
      return res.json([]);
    }

    const bookings = await Booking.findAll({
      where: {
        ...whereCondition,
        status: 'confirmed'
      },
      include: [
        { 
          model: Event, 
          attributes: ['id', 'title', 'imageUrl'] 
        },
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email'],
          required: false
        },
        { 
          model: User, 
          as: 'seller', 
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const chatsWithLastMessage = await Promise.all(
      bookings.map(async (booking) => {
        const lastMessage = await Message.findOne({
          where: { bookingId: booking.id },
          order: [['created_at', 'DESC']],
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name'] }
          ]
        });

        const unreadCount = await Message.count({
          where: {
            bookingId: booking.id,
            receiverId: userId,
            read: false
          }
        });

        return {
          bookingId: booking.id,
          event: booking.Event,
          participant: userRole === 'user' ? booking.seller : booking.user,
          lastMessage: lastMessage,
          unreadCount: unreadCount,
          createdAt: booking.createdAt
        };
      })
    );

    res.json(chatsWithLastMessage);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Ошибка загрузки чатов' });
  }
});

module.exports = router;
