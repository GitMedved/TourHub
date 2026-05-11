const {
  TripMember
} = require('./trip.associations');

async function requireTripMember(req, res, next) {
  try {
    const membership = await TripMember.findOne({
      where: {
        tripId: req.params.tripId,
        userId: req.user.id
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    req.tripMembership = membership;

    next();

  } catch (error) {
    next(error);
  }
}

async function requireTripEditor(req, res, next) {
  try {
    const membership = await TripMember.findOne({
      where: {
        tripId: req.params.tripId,
        userId: req.user.id
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const allowedRoles = [
      'OWNER',
      'EDITOR'
    ];

    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        error: 'Editor access required'
      });
    }

    req.tripMembership = membership;

    next();

  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireTripMember,
  requireTripEditor
};
