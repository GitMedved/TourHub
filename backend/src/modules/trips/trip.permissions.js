const {
  Trip,
  TripMember,
  TripPlace
} = require('./trip.associations');

const normalizeRole = (role) => {
  if (role === 'OWNER') return 'owner';
  if (role === 'EDITOR') return 'editor';
  if (role === 'VIEWER') return 'member';
  return role || 'member';
};

const findMembership = (tripId, userId) => TripMember.findOne({
  where: {
    tripId,
    userId
  }
});

const requireTripMember = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const membership = await findMembership(tripId, req.user.id);

    if (!membership) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Trip membership required'
      });
    }

    req.tripMember = membership;
    req.tripRole = normalizeRole(membership.role);
    return next();
  } catch (error) {
    console.error('requireTripMember failed:', error);

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

const requireTripEditor = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Trip not found'
      });
    }

    const membership = await findMembership(tripId, req.user.id);
    const role = normalizeRole(membership?.role);

    if (!membership || !['owner', 'editor'].includes(role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Editor role required'
      });
    }

    req.trip = trip;
    req.tripMember = membership;
    req.tripRole = role;
    return next();
  } catch (error) {
    console.error('requireTripEditor failed:', error);

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

const requirePlaceTripMember = async (req, res, next) => {
  try {
    const place = await TripPlace.findByPk(req.params.placeId);

    if (!place) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Place not found'
      });
    }

    const membership = await findMembership(place.tripId, req.user.id);

    if (!membership) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Trip membership required'
      });
    }

    req.tripPlace = place;
    req.tripMember = membership;
    req.tripRole = normalizeRole(membership.role);
    return next();
  } catch (error) {
    console.error('requirePlaceTripMember failed:', error);

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

module.exports = {
  requireTripMember,
  requireTripEditor,
  requirePlaceTripMember,
  normalizeRole
};
