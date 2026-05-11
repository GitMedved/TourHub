const express = require('express');

const router = express.Router();

const {
  authMiddleware
} = require('../../middleware/auth');

const tripController =
  require('./trip.controller');

const {
  requireTripMember,
  requireTripEditor
} = require('./trip.permissions');

router.use(authMiddleware);

router.get(
  '/',
  tripController.getTrips
);

router.get(
  '/:tripId',
  requireTripMember,
  tripController.getTripById
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

router.post(
  '/:tripId/invite',
  requireTripMember,
  tripController.createInvite
);

router.post(
  '/join/:token',
  tripController.joinTrip
);

module.exports = router;
