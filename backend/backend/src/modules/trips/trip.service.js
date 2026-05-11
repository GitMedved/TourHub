const { getIO } = require('../../socket');

const {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment
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

  return trip;
}

async function getUserTrips(userId) {
  return Trip.findAll({
    include: [
      {
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'email'],
        through: {
          attributes: ['role']
        }
      },
      {
        model: TripPlace,
        as: 'places',
        include: [
          {
            model: TripVote,
            as: 'votes'
          }
        ]
      },
      {
        model: TripComment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}

async function addPlaceToTrip(tripId, data) {

  const place = await TripPlace.create({
    ...data,
    tripId
  });

  getIO().to(`trip:${tripId}`)
    .emit('place:created', place);

  return place;
}

async function voteForPlace(placeId, userId, value) {

  const existingVote = await TripVote.findOne({
    where: {
      placeId,
      userId
    }
  });

  let vote;

  if (existingVote) {

    existingVote.value = value;

    await existingVote.save();

    vote = existingVote;

  } else {

    vote = await TripVote.create({
      placeId,
      userId,
      value
    });
  }

  const place = await TripPlace.findByPk(placeId);

  getIO().to(`trip:${place.tripId}`)
    .emit('place:voted', {
      placeId,
      userId,
      value
    });

  return vote;
}

  if (existingVote) {
    existingVote.value = value;
    await existingVote.save();
    return existingVote;
  }

  return TripVote.create({
    placeId,
    userId,
    value
  });
}

async function addComment(tripId, userId, content) {

  const comment = await TripComment.create({
    tripId,
    userId,
    content
  });

  getIO().to(`trip:${tripId}`)
    .emit('comment:created', comment);

  return comment;
}

module.exports = {
  createTrip,
  getUserTrips,
  addPlaceToTrip,
  voteForPlace,
  addComment
};
