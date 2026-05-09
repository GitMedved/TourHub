const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');
const Seller = require('../models/Seller');
const { Op } = require('sequelize');

// Отзывы для события (только одобренные)
router.get('/event/:eventId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { eventId: req.params.eventId, isApproved: true },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Отзывы для продавца (только одобренные)
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { sellerId: req.params.sellerId, isApproved: true },
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] }, 
        { model: Event, as: 'event', attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Админ: отзывы на модерации
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') return res.status(403).json({ error: 'Access denied' });
    const reviews = await Review.findAll({
      where: { isApproved: false },
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
        { model: Event, as: 'event', attributes: ['title'] },
        { model: Seller, as: 'seller', attributes: ['companyName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Одобрить отзыв
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') return res.status(403).json({ error: 'Access denied' });
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Not found' });
    
    await review.update({ isApproved: true });
    
    // Обновить рейтинг события
    const eventReviews = await Review.findAll({ where: { eventId: review.eventId, isApproved: true } });
    if (eventReviews.length > 0) {
      const avgEventRating = eventReviews.reduce((sum, r) => sum + r.eventRating, 0) / eventReviews.length;
      await Event.update(
        { rating: parseFloat(avgEventRating.toFixed(1)), reviewCount: eventReviews.length },
        { where: { id: review.eventId } }
      );
    }
    
    // Обновить рейтинг продавца
    const sellerReviews = await Review.findAll({ where: { sellerId: review.sellerId, isApproved: true } });
    if (sellerReviews.length > 0) {
      const avgSellerRating = sellerReviews.reduce((sum, r) => sum + r.sellerRating, 0) / sellerReviews.length;
      await Seller.update(
        { rating: parseFloat(avgSellerRating.toFixed(1)), reviewCount: sellerReviews.length },
        { where: { id: review.sellerId } }
      );
    }
    
    res.json(review);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') return res.status(403).json({ error: 'Access denied' });
    await Review.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
