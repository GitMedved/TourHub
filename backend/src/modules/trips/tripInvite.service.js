const tripService = require('./trip.service');

const createInvite = async ({
  tripId,
  invitedBy,
  maxUses,
  expiresInHours
}) => tripService.createInvite(
  tripId,
  invitedBy,
  {
    maxUses,
    expiresInHours
  }
);

const joinTripByInvite = async ({
  token,
  userId
}) => tripService.joinTripByInvite(
  token,
  userId
);

module.exports = {
  createInvite,
  joinTripByInvite
};
