const {
  Trip,
  TripMember
} = require('./trip.associations');

const requireTripMember = async (
  req,
  res,
  next
) => {

  try {

    const tripId = req.params.tripId;

    const membership =
      await TripMember.findOne({
        where: {
          tripId,
          userId: req.user.id
        }
      });

    if (!membership) {

      return res.status(403).json({
        message: 'Access denied'
      });
    }

    next();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const requireTripEditor = async (
  req,
  res,
  next
) => {

  try {

    const tripId = req.params.tripId;

    const trip =
      await Trip.findByPk(tripId);

    if (!trip) {

      return res.status(404).json({
        message: 'Trip not found'
      });
    }

    const membership =
      await TripMember.findOne({
        where: {
          tripId,
          userId: req.user.id
        }
      });

    if (!membership) {

      return res.status(403).json({
        message: 'Only trip members can edit'
      });
    }

    next();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  requireTripMember,
  requireTripEditor
};
