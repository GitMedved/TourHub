const crypto = require('crypto');

const TripInvite =
  require('./tripInvite.model');

const TripMember =
  require('./tripMember.model');

const Trip =
  require('./trip.model');

const createInvite = async ({
  tripId,
  invitedBy
}) => {

  const token =
    crypto.randomBytes(24)
      .toString('hex');

  const expiresAt =
    new Date(
      Date.now() +
      1000 * 60 * 60 * 24 * 7
    );

  const invite =
    await TripInvite.create({
      token,
      tripId,
      invitedBy,
      expiresAt
    });

  return invite;
};

const joinTripByInvite = async ({
  token,
  userId
}) => {

  const invite =
    await TripInvite.findOne({
      where: {
        token
      }
    });

  if (!invite) {
    throw new Error('Invite not found');
  }

  if (invite.usedAt) {
    throw new Error('Invite already used');
  }

  if (
    new Date(invite.expiresAt) <
    new Date()
  ) {
    throw new Error('Invite expired');
  }

  const existingMember =
    await TripMember.findOne({
      where: {
        tripId: invite.tripId,
        userId
      }
    });

  if (!existingMember) {

    await TripMember.create({
      tripId: invite.tripId,
      userId,
      role: 'MEMBER'
    });

  }

  invite.usedAt = new Date();

  await invite.save();

  const trip =
    await Trip.findByPk(invite.tripId);

  return trip;
};

module.exports = {
  createInvite,
  joinTripByInvite
};
