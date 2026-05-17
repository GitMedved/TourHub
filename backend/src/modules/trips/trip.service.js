const crypto = require('crypto');
const {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment,
  TripInvite,
  User
} = require('./trip.associations');

const { getIO } = require('../../socket');

const userPublicAttributes = [
  'id',
  'email',
  'firstName',
  'lastName',
  'avatar'
];

const emitToTrip = (tripId, event, payload) => {
  try {
    getIO()
      .to(`trip:${tripId}`)
      .emit(event, {
        event,
        tripId,
        ...payload
      });
  } catch (error) {
    console.error('Socket emit failed:', error.message);
  }
};

const normalizeRole = (role) => {
  if (role === 'OWNER') return 'owner';
  if (role === 'EDITOR') return 'editor';
  if (role === 'VIEWER') return 'member';
  return role || 'member';
};

const valueToVoteType = (value) => (
  Number(value) < 0 ? 'downvote' : 'upvote'
);

const voteTypeToValue = (voteType) => (
  voteType === 'downvote' ? -1 : 1
);

const getVoteAggregates = async (tripPlaceId, userId) => {
  const votes = await TripVote.findAll({
    where: { tripPlaceId }
  });

  return votes.reduce((aggregated, vote) => {
    if (vote.voteType === 'upvote') {
      aggregated.upvotes += 1;
    }

    if (vote.voteType === 'downvote') {
      aggregated.downvotes += 1;
    }

    if (userId && vote.userId === userId) {
      aggregated.myVote = vote.voteType;
    }

    return aggregated;
  }, {
    upvotes: 0,
    downvotes: 0,
    myVote: null
  });
};

const formatPlace = async (place, userId) => {
  const plain = place.get ? place.get({ plain: true }) : place;
  const votes = await getVoteAggregates(plain.id, userId);

  return {
    ...plain,
    title: plain.title || plain.name,
    name: plain.name || plain.title,
    latitude: plain.latitude ?? plain.lat,
    longitude: plain.longitude ?? plain.lng,
    votes
  };
};

const createTrip = async (data, userId) => {
  const trip = await Trip.create({
    ...data,
    destination: data.destination || data.title,
    ownerId: userId,
    status: data.status || 'planning'
  });

  await TripMember.create({
    tripId: trip.id,
    userId,
    role: 'owner'
  });

  return trip;
};

const getUserTrips = async (userId) => {
  const memberships = await TripMember.findAll({
    where: { userId },
    include: [
      {
        model: Trip,
        as: 'trip',
        include: [
          {
            model: User,
            as: 'owner',
            attributes: userPublicAttributes
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
                as: 'author',
                attributes: userPublicAttributes
              }
            ]
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return memberships
    .filter((membership) => membership.trip)
    .map((membership) => ({
      ...membership.trip.get({ plain: true }),
      myRole: normalizeRole(membership.role)
    }));
};

const getTripById = async (tripId, userId) => {
  const trip = await Trip.findByPk(tripId, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: userPublicAttributes
      },
      {
        model: TripMember,
        as: 'members',
        include: [
          {
            model: User,
            as: 'user',
            attributes: userPublicAttributes
          }
        ]
      },
      {
        model: TripPlace,
        as: 'places',
        include: [
          {
            model: User,
            as: 'addedBy',
            attributes: userPublicAttributes
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
            attributes: userPublicAttributes
          }
        ]
      },
      {
        model: TripInvite,
        as: 'invites',
        include: [
          {
            model: User,
            as: 'createdBy',
            attributes: userPublicAttributes
          }
        ]
      }
    ]
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.status = 404;
    throw error;
  }

  const plain = trip.get({ plain: true });
  const myMembership = plain.members.find(
    (member) => member.userId === userId
  );

  return {
    ...plain,
    myRole: normalizeRole(myMembership?.role),
    places: await Promise.all(
      plain.places.map((place) => formatPlace(place, userId))
    )
  };
};

const addPlace = async (tripId, data, userId) => {
  const name = data.name || data.title;

  const place = await TripPlace.create({
    tripId,
    addedById: userId,
    name,
    title: data.title || name,
    description: data.description || data.notes,
    address: data.address,
    latitude: data.latitude ?? data.lat,
    longitude: data.longitude ?? data.lng,
    lat: data.lat ?? data.latitude,
    lng: data.lng ?? data.longitude,
    notes: data.notes,
    order: data.order || 0
  });

  const fullPlace = await TripPlace.findByPk(place.id, {
    include: [
      {
        model: User,
        as: 'addedBy',
        attributes: userPublicAttributes
      }
    ]
  });

  const payloadPlace = await formatPlace(fullPlace, userId);

  emitToTrip(tripId, 'place:added', {
    place: payloadPlace
  });

  return payloadPlace;
};

const addComment = async (tripId, data, userId) => {
  const comment = await TripComment.create({
    content: data.content,
    tripId,
    authorId: userId
  });

  const fullComment = await TripComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: userPublicAttributes
      }
    ]
  });

  emitToTrip(tripId, 'comment:added', {
    comment: fullComment
  });

  return fullComment;
};

const voteForPlace = async (placeId, voteInput, userId) => {
  const voteType = typeof voteInput === 'number'
    ? valueToVoteType(voteInput)
    : voteInput;

  const place = await TripPlace.findByPk(placeId);

  if (!place) {
    const error = new Error('Place not found');
    error.status = 404;
    throw error;
  }

  const existingVote = await TripVote.findOne({
    where: {
      tripPlaceId: placeId,
      userId
    }
  });

  let vote = null;

  if (existingVote?.voteType === voteType) {
    await existingVote.destroy();
  } else if (existingVote) {
    existingVote.voteType = voteType;
    existingVote.value = voteTypeToValue(voteType);
    await existingVote.save();
    vote = existingVote;
  } else {
    vote = await TripVote.create({
      tripPlaceId: placeId,
      userId,
      voteType,
      value: voteTypeToValue(voteType)
    });
  }

  const aggregated = await getVoteAggregates(placeId, userId);

  emitToTrip(place.tripId, 'place:voted', {
    placeId,
    aggregated,
    voterId: userId
  });

  return {
    vote,
    aggregated
  };
};

const createInvite = async (tripId, userId, options = {}) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = options.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
    : null;

  const invite = await TripInvite.create({
    tripId,
    createdById: userId,
    invitedBy: userId,
    token,
    maxUses: options.maxUses ?? null,
    expiresAt
  });

  return {
    invite: {
      ...invite.get({ plain: true }),
      inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${token}`
    },
    token,
    inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${token}`
  };
};

const joinTripByInvite = async (token, userId) => {
  const invite = await TripInvite.findOne({
    where: { token },
    include: [
      {
        model: Trip,
        as: 'trip'
      }
    ]
  });

  if (!invite || invite.isRevoked) {
    const error = new Error('Invite not found');
    error.status = 404;
    throw error;
  }

  const now = new Date();
  const expired = invite.expiresAt && invite.expiresAt <= now;
  const exhausted = invite.maxUses && invite.useCount >= invite.maxUses;

  if (expired || exhausted) {
    const error = new Error('Invite expired or exhausted');
    error.status = 410;
    throw error;
  }

  const existingMember = await TripMember.findOne({
    where: {
      tripId: invite.tripId,
      userId
    }
  });

  if (existingMember) {
    const error = new Error('Already a member');
    error.status = 409;
    throw error;
  }

  await TripMember.create({
    tripId: invite.tripId,
    userId,
    role: 'member'
  });

  invite.useCount += 1;
  invite.usedAt = now;
  await invite.save();

  return {
    trip: invite.trip,
    role: 'member'
  };
};

const findMembershipForPlace = async (placeId, userId) => {
  const place = await TripPlace.findByPk(placeId);

  if (!place) {
    return null;
  }

  return TripMember.findOne({
    where: {
      tripId: place.tripId,
      userId
    }
  });
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  addPlace,
  addComment,
  voteForPlace,
  createInvite,
  joinTripByInvite,
  findMembershipForPlace,
  normalizeRole
};
