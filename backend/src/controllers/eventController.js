const Event = require('../models/Event');
const Seller = require('../models/Seller');

if (!Event.associations.Seller) {
  Event.belongsTo(Seller, { foreignKey: 'sellerId', as: 'Seller' });
}

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return [value];
};

const normalizeEventPayload = (body) => ({
  ...body,
  images: normalizeList(body.images),
  videos: normalizeList(body.videos),
  externalLinks: normalizeList(body.externalLinks),
  durationDays: body.durationDays ? Number(body.durationDays) : undefined,
  durationHours: body.durationHours ? Number(body.durationHours) : undefined,
  maxParticipants: body.maxParticipants ? Number(body.maxParticipants) : undefined,
  latitude: body.latitude ? Number(body.latitude) : undefined,
  longitude: body.longitude ? Number(body.longitude) : undefined
});

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
    const payload = normalizeEventPayload(req.body);
    const event = await Event.create({
      ...payload, sellerId: seller.id,
      isPublished: false, moderationStatus: 'pending'
    });
    res.status(201).json(event);
  } catch (error) { 
    console.error('createEvent error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

module.exports = { getAllEvents, getEventById, createEvent };
