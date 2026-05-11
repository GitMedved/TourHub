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

Trip.belongsToMany(User, {
  through: TripMember,
  foreignKey: 'tripId',
  otherKey: 'userId',
  as: 'members'
});

Trip.hasMany(TripPlace, {
  foreignKey: 'tripId',
  as: 'places'
});

Trip.hasMany(TripComment, {
  foreignKey: 'tripId',
  as: 'comments'
});

module.exports = {
  Trip,
  TripMember,
  TripPlace,
  TripVote,
  TripComment
};
