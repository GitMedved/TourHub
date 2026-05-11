const express = require('express');

const router = express.Router();

const auth = require('../../middleware/auth');

const tripController = require('./trip.controller');

const {
  requireTripMember,
  requireTripEditor
} = require('./trip.permissions');

router.use(auth);

router.get(
  '/',
  tripController.getTrips
);

router.post(
  '/',
  tripController.createTrip
);

router.post(
  '/:tripId/places',
  requireTripEditor,
  tripController.addPlace
);

router.post(
  '/:tripId/comments',
  requireTripMember,
  tripController.addComment
);

router.post(
  '/places/:placeId/vote',
  tripController.voteForPlace
);

module.exports = router;
