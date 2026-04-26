const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authMiddleware, createEvent);

module.exports = router;
