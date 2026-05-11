const {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment,
  TripInvite
} = require('./trip.associations');

const User = require('../../models/User');

async function createTrip(userId, data) {

  const trip = await Trip.create({
    ...data,
    ownerId: userId
  });

  await TripMember.create({
    tripId: trip.id,
    userId,
    role: 'OWNER'
  });

  return getTripById(trip.id);
}

async function getUserTrips(userId) {

  const memberships = await TripMember.findAll({
    where: {
      userId
    }
  });

  const tripIds = memberships.map(
    (membership) => membership.tripId
  );

  const crypto = require('crypto');

  return Trip.findAll({
    where: {
      id: tripIds
    },

    include: [
      {
        model: User,
        as: 'owner',
        attributes: [
          'id',
          'name',
          'email'
        ]
      },

      {
        model: User,
        as: 'members',

        attributes: [
          'id',
          'name',
          'email'
        ],

        through: {
          attributes: ['role']
        }
      },

      {
        model: TripPlace,
        as: 'places'
      },

      {
        model: TripComment,
        as: 'comments'
      }
    ],

    order: [['createdAt', 'DESC']]
  });
}

async function getTripById(tripId) {

  return Trip.findByPk(tripId, {

    include: [
      {
        model: User,
        as: 'owner',
        attributes: [
          'id',
          'name',
          'email'
        ]
      },

      {
        model: User,
        as: 'members',

        attributes: [
          'id',
          'name',
          'email'
        ],

        through: {
          attributes: ['role']
        }
      },

      {
        model: TripPlace,
        as: 'places'
      },

      {
        model: TripComment,
        as: 'comments'
      }
    ]
  });
}

async function addPlaceToTrip(
  tripId,
  data
) {

  const place = await TripPlace.create({
    ...data,
    tripId
  });

  return place;
}

async function voteForPlace(
  placeId,
  userId,
  value
) {

  const existingVote = await TripVote.findOne({
    where: {
      placeId,
      userId
    }
  });

  if (existingVote) {

    existingVote.value = value;

    await existingVote.save();

  } else {

    await TripVote.create({
      placeId,
      userId,
      value
    });
  }

  const votes = await TripVote.findAll({
    where: {
      placeId
    }
  });

  const score = votes.reduce(
    (sum, vote) => sum + vote.value,
    0
  );

  const place = await TripPlace.findByPk(placeId);

  place.voteScore = score;

  await place.save();

  return place;
}

async function addComment(
  tripId,
  userId,
  content
) {

  return TripComment.create({
    tripId,
    userId,
    content
  });
}

async function addMember(
  tripId,
  userId
) {

  const existingMember =
    await TripMember.findOne({
      where: {
        tripId,
        userId
      }
    });

  if (existingMember) {
    return existingMember;
  }

  return TripMember.create({
    tripId,
    userId,
    role: 'EDITOR'
  });
}

async function createInviteLink(
  tripId,
  userId
) {

  const token = crypto
    .randomBytes(24)
    .toString('hex');

  const invite = await TripInvite.create({
    token,
    tripId,
    invitedBy: userId,

    expiresAt: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7
    )
  });

  return invite;
}

async function joinTripByInvite(
  token,
  userId
) {

  const invite = await TripInvite.findOne({
    where: { token }
  });

  if (!invite) {
    throw new Error('Invite not found');
  }

  if (
    invite.expiresAt < new Date()
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

  return Trip.findByPk(invite.tripId);
}

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  addPlaceToTrip,
  voteForPlace,
  addComment,
  addMember,
  createInviteLink,
  joinTripByInvite
};
