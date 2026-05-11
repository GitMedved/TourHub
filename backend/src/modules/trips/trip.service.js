const {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment,
  TripInvite
} = require('./trip.associations');

const User = require('../../models/User');

const { getIO } = require('../../socket');

/* =========================
   CREATE TRIP
========================= */

const createTrip = async (
  data,
  userId
) => {

  const trip = await Trip.create({
    ...data,
    ownerId: userId
  });

  await TripMember.create({
    tripId: trip.id,
    userId
  });

  return trip;
};

/* =========================
   GET USER TRIPS
========================= */

const getUserTrips = async (
  userId
) => {

  return Trip.findAll({
    include: [
      {
        model: User,
        as: 'members',
        where: { id: userId },
        through: {
          attributes: []
        }
      },
      {
        model: User,
        as: 'owner'
      },
      {
        model: TripPlace,
        as: 'places'
      },
      {
        model: TripComment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'author'
          }
        ]
      }
    ],
    order: [
      ['createdAt', 'DESC']
    ]
  });
};

/* =========================
   GET TRIP BY ID
========================= */

const getTripById = async (
  tripId
) => {

  return Trip.findByPk(tripId, {
    include: [
      {
        model: User,
        as: 'owner'
      },
      {
        model: User,
        as: 'members',
        through: {
          attributes: []
        }
      },
      {
        model: TripPlace,
        as: 'places'
      },
      {
        model: TripComment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'author'
          }
        ]
      }
    ]
  });
};

/* =========================
   ADD PLACE
========================= */

const addPlace = async (
  tripId,
  data,
  userId
) => {

  const place = await TripPlace.create({
    title: data.title,
    description: data.description,
    tripId,
    createdBy: userId
  });

  getIO()
    .to(`trip:${tripId}`)
    .emit('place:added', place);

  return place;
};

/* =========================
   ADD COMMENT
========================= */

const addComment = async (
  tripId,
  data,
  userId
) => {

  const comment = await TripComment.create({
    content: data.content,
    tripId,
    userId
  });

  const fullComment =
    await TripComment.findByPk(
      comment.id,
      {
        include: [
          {
            model: User,
            as: 'author'
          }
        ]
      }
    );

  getIO()
    .to(`trip:${tripId}`)
    .emit(
      'comment:added',
      fullComment
    );

  return fullComment;
};

/* =========================
   VOTE FOR PLACE
========================= */

const voteForPlace = async (
  placeId,
  value,
  userId
) => {

  const existingVote =
    await TripVote.findOne({
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

  const votes =
    await TripVote.findAll({
      where: { placeId }
    });

  const totalVotes =
    votes.reduce(
      (sum, vote) =>
        sum + vote.value,
      0
    );

  const place =
    await TripPlace.findByPk(
      placeId
    );

  getIO()
    .to(`trip:${place.tripId}`)
    .emit(
      'place:voted',
      {
        placeId,
        totalVotes
      }
    );

  return {
    success: true,
    totalVotes
  };
};

/* =========================
   CREATE INVITE
========================= */

const createInvite = async (
  tripId,
  userId
) => {

  const token =
    Math.random()
      .toString(36)
      .substring(2);

  const invite =
    await TripInvite.create({
      tripId,
      invitedBy: userId,
      token
    });

  return {
    token,
    inviteUrl:
      `http://localhost:3000/join-trip/${token}`,
    invite
  };
};

/* =========================
   JOIN TRIP BY INVITE
========================= */

const joinTripByInvite = async (
  token,
  userId
) => {

  const invite =
    await TripInvite.findOne({
      where: { token }
    });

  if (!invite) {
    throw new Error(
      'Invite not found'
    );
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
      userId
    });
  }

  return {
    success: true,
    tripId: invite.tripId
  };
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  addPlace,
  addComment,
  voteForPlace,
  createInvite,
  joinTripByInvite
};