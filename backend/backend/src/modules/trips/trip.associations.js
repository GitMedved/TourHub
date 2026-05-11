const Trip = require('./trip.model');
const TripMember = require('./tripMember.model');
const TripPlace = require('./tripPlace.model');
const TripVote = require('./tripVote.model');
const TripComment = require('./tripComment.model');

const User = require('../../models/User');

Trip.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

User.hasMany(Trip, {
  foreignKey: 'ownerId',
  as: 'ownedTrips'
});

Trip.belongsToMany(User, {
  through: TripMember,
  foreignKey: 'tripId',
  otherKey: 'userId',
  as: 'members'
});

User.belongsToMany(Trip, {
  through: TripMember,
  foreignKey: 'userId',
  otherKey: 'tripId',
  as: 'trips'
});

Trip.hasMany(TripPlace, {
  foreignKey: 'tripId',
  as: 'places',
  onDelete: 'CASCADE'
});

TripPlace.belongsTo(Trip, {
  foreignKey: 'tripId'
});

TripPlace.hasMany(TripVote, {
  foreignKey: 'placeId',
  as: 'votes',
  onDelete: 'CASCADE'
});

TripVote.belongsTo(TripPlace, {
  foreignKey: 'placeId'
});

TripVote.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Trip.hasMany(TripComment, {
  foreignKey: 'tripId',
  as: 'comments',
  onDelete: 'CASCADE'
});

TripComment.belongsTo(Trip, {
  foreignKey: 'tripId'
});

TripComment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

module.exports = {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment
};
