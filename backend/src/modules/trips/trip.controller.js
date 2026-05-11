const {
  createTripSchema,
  addPlaceSchema,
  voteSchema,
  commentSchema
} = require('./trip.validation');

const tripService = require('./trip.service');

async function createTrip(req, res, next) {
  try {
    const validatedData = createTripSchema.parse(req.body);

    const trip = await tripService.createTrip(
      req.user.id,
      validatedData
    );

    res.status(201).json(trip);

  } catch (error) {
    next(error);
  }
}

async function getTrips(req, res, next) {
  try {
    const trips = await tripService.getUserTrips(
      req.user.id
    );

    res.json(trips);

  } catch (error) {
    next(error);
  }
}

async function addPlace(req, res, next) {
  try {
    const validatedData = addPlaceSchema.parse(req.body);

    const place = await tripService.addPlaceToTrip(
      req.params.tripId,
      validatedData
    );

    res.status(201).json(place);

  } catch (error) {
    next(error);
  }
}

async function voteForPlace(req, res, next) {
  try {
    const validatedData = voteSchema.parse(req.body);

    const vote = await tripService.voteForPlace(
      req.params.placeId,
      req.user.id,
      validatedData.value
    );

    res.json(vote);

  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const validatedData = commentSchema.parse(req.body);

    const comment = await tripService.addComment(
      req.params.tripId,
      req.user.id,
      validatedData.content
    );

    res.status(201).json(comment);

  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTrip,
  getTrips,
  addPlace,
  voteForPlace,
  addComment
};
