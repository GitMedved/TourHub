const Event = require('../models/Event');
const Seller = require('../models/Seller');

if (!Event.associations.Seller) {
  Event.belongsTo(Seller, { foreignKey: 'sellerId', as: 'Seller' });
}

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { isPublished: true, moderationStatus: 'approved' },
      include: [{ model: Seller, as: 'Seller', attributes: ['companyName', 'rating', 'reviewCount'] }],
      order: [['rating', 'DESC'], ['reviewCount', 'DESC']]
    });
    
    const eventsWithSeller = events.map(event => {
      const plain = event.get({ plain: true });
      return {
        ...plain,
        sellerCompanyName: plain.Seller?.companyName || null,
        sellerRating: plain.Seller?.rating || 0,
        sellerReviewCount: plain.Seller?.reviewCount || 0
      };
    });
    
    res.json({ content: eventsWithSeller, totalPages: 1, totalElements: events.length, page: 1, size: events.length });
  } catch (error) { 
    console.error('getAllEvents error:', error); 
    res.status(500).json({ error: error.message }); 
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Seller, as: 'Seller', attributes: ['companyName', 'rating', 'reviewCount'] }]
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const plain = event.get({ plain: true });
    res.json({
      ...plain,
      sellerCompanyName: plain.Seller?.companyName || null,
      sellerRating: plain.Seller?.rating || 0,
      sellerReviewCount: plain.Seller?.reviewCount || 0
    });
  } catch (error) { 
    console.error('getEventById error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

const createEvent = async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) return res.status(400).json({ error: 'Seller profile not found' });
    const event = await Event.create({
      ...req.body, sellerId: seller.id,
      isPublished: false, moderationStatus: 'pending'
    });
    res.status(201).json(event);
  } catch (error) { 
    console.error('createEvent error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

module.exports = { getAllEvents, getEventById, createEvent };
