const express = require('express');
const router = express.Router();
const { Booking, Event, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.get('/confirmed-with-seller', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Доступ только для продавцов' });
    }

    const bookings = await Booking.findAll({
      where: {
        sellerId: req.user.id,
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
          attributes: ['id', 'name', 'email', 'phone'] 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching confirmed bookings:', error);
    res.status(500).json({ error: 'Ошибка загрузки бронирований' });
  }
});

module.exports = router;
