const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Wishlist, Event, Seller } = require('../models');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Event,
        as: 'event',
        include: [{ model: Seller, as: 'seller', attributes: ['companyName', 'rating', 'reviewCount'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ content: items, totalElements: items.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:eventId/status', authMiddleware, async (req, res) => {
  try {
    const item = await Wishlist.findOne({ where: { userId: req.user.id, eventId: req.params.eventId } });
    res.json({ saved: Boolean(item) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const [item] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, eventId: req.params.eventId }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:eventId', authMiddleware, async (req, res) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id, eventId: req.params.eventId } });
    res.json({ saved: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
