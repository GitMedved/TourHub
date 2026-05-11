const tripService = require('./trip.service');

const createTrip = async (req, res) => {

  const trip =
    await tripService.createTrip(
      req.body,
      req.user.id
    );

  res.status(201).json(trip);
};

const getTrips = async (req, res) => {

  const trips =
    await tripService.getUserTrips(
      req.user.id
    );

  res.json(trips);
};

const getTripById = async (req, res) => {

  const trip =
    await tripService.getTripById(
      req.params.tripId
    );

  res.json(trip);
};

const addPlace = async (req, res) => {

  const place =
    await tripService.addPlace(
      req.params.tripId,
      req.body,
      req.user.id
    );

  res.status(201).json(place);
};

const voteForPlace = async (req, res) => {

  const result =
    await tripService.voteForPlace(
      req.params.placeId,
      req.body.value,
      req.user.id
    );

  res.json(result);
};

const addComment = async (req, res) => {

  const comment =
    await tripService.addComment(
      req.params.tripId,
      req.body,
      req.user.id
    );

  res.status(201).json(comment);
};

const createInvite = async (
  req,
  res
) => {

  const invite =
    await tripService.createInvite(
      req.params.tripId,
      req.user.id
    );

  res.status(201).json(invite);
};

const joinTrip = async (req, res) => {

  const result =
    await tripService.joinTripByInvite(
      req.params.token,
      req.user.id
    );

  res.json(result);
};

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
