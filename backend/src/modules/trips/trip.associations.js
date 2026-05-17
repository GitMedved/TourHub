const Trip = require('./trip.model');
const TripMember = require('./tripMember.model');
const TripPlace = require('./tripPlace.model');
const TripVote = require('./tripVote.model');
const TripComment = require('./tripComment.model');
const TripInvite = require('./tripInvite.model');
const User = require('../../models/User');

/*
 * Keep this file as the single source of truth for Sequelize aliases used by
 * the trips module. Every include in controllers/services must use these exact
 * `as` values to avoid SequelizeEagerLoadingError at runtime.
 */

// ========== User ==========
User.hasMany(Trip, { foreignKey: 'ownerId', as: 'ownedTrips' });
User.hasMany(TripMember, { foreignKey: 'userId', as: 'memberships' });
User.hasMany(TripPlace, { foreignKey: 'addedById', as: 'addedPlaces' });
User.hasMany(TripVote, { foreignKey: 'userId', as: 'votes' });
User.hasMany(TripComment, { foreignKey: 'authorId', as: 'authoredComments' });
User.hasMany(TripInvite, { foreignKey: 'createdById', as: 'createdInvites' });

// ========== Trip ==========
Trip.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Trip.hasMany(TripMember, { foreignKey: 'tripId', as: 'members' });
Trip.hasMany(TripPlace, { foreignKey: 'tripId', as: 'places' });
Trip.hasMany(TripComment, { foreignKey: 'tripId', as: 'comments' });
Trip.hasMany(TripInvite, { foreignKey: 'tripId', as: 'invites' });

// ========== TripMember ==========
TripMember.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
TripMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ========== TripPlace ==========
TripPlace.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
TripPlace.belongsTo(User, { foreignKey: 'addedById', as: 'addedBy' });
TripPlace.hasMany(TripVote, { foreignKey: 'tripPlaceId', as: 'votes' });

// ========== TripVote ==========
TripVote.belongsTo(TripPlace, { foreignKey: 'tripPlaceId', as: 'place' });
TripVote.belongsTo(User, { foreignKey: 'userId', as: 'voter' });

// ========== TripComment ==========
TripComment.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
TripComment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// ========== TripInvite ==========
TripInvite.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
TripInvite.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

module.exports = {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment,
  TripInvite,
  User
};
