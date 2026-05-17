const express = require('express');

const router = express.Router();

const {
  authMiddleware
} = require('../../middleware/auth');

const tripController = require('./trip.controller');

const {
  requireTripMember,
  requireTripEditor,
  requirePlaceTripMember
} = require('./trip.permissions');

const {
  createTripSchema,
  addPlaceSchema,
  voteSchema,
  commentSchema,
  inviteSchema,
  validateBody
} = require('./trip.validation');

router.use(authMiddleware);

router.get(
  '/',
  tripController.getTrips
);

router.post(
  '/',
  validateBody(createTripSchema),
  tripController.createTrip
);

router.get(
  '/:tripId',
  requireTripMember,
  tripController.getTripById
);

router.post(
  '/:tripId/places',
  requireTripEditor,
  validateBody(addPlaceSchema),
  tripController.addPlace
);

router.post(
  '/:tripId/comments',
  requireTripMember,
  validateBody(commentSchema),
  tripController.addComment
);

router.post(
  '/places/:placeId/vote',
  requirePlaceTripMember,
  validateBody(voteSchema),
  tripController.voteForPlace
);

router.post(
  '/:tripId/invite',
  requireTripMember,
  validateBody(inviteSchema),
  tripController.createInvite
);

router.post(
  '/join/:token',
  tripController.joinTrip
);

module.exports = router;
