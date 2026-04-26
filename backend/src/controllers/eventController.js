const Event = require('../models/Event');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json({
      content: events,
      totalPages: 1,
      totalElements: events.length,
      page: 1,
      size: events.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent };
