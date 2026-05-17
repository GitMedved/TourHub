const tripService = require('./trip.service');

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(
    req.body,
    req.user.id
  );

  res.status(201).json(trip);
});

const getTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getUserTrips(
    req.user.id
  );

  res.json(trips);
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(
    req.params.tripId,
    req.user.id
  );

  res.json(trip);
});

const addPlace = asyncHandler(async (req, res) => {
  const place = await tripService.addPlace(
    req.params.tripId,
    req.body,
    req.user.id
  );

  res.status(201).json(place);
});

const voteForPlace = asyncHandler(async (req, res) => {
  const result = await tripService.voteForPlace(
    req.params.placeId,
    req.body.voteType || req.body.value,
    req.user.id
  );

  res.json(result);
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await tripService.addComment(
    req.params.tripId,
    req.body,
    req.user.id
  );

  res.status(201).json(comment);
});

const createInvite = asyncHandler(async (req, res) => {
  const invite = await tripService.createInvite(
    req.params.tripId,
    req.user.id,
    req.body
  );

  res.status(201).json(invite);
});

const joinTrip = asyncHandler(async (req, res) => {
  const result = await tripService.joinTripByInvite(
    req.params.token,
    req.user.id
  );

  res.json(result);
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  addPlace,
  voteForPlace,
  addComment,
  createInvite,
  joinTrip
};
