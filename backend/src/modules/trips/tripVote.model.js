const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripVote = sequelize.define('TripVote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  tripPlaceId: {
    type: DataTypes.UUID
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  voteType: {
    type: DataTypes.ENUM('upvote', 'downvote'),
    allowNull: false
  },

  value: {
    type: DataTypes.INTEGER
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tripPlaceId', 'userId']
    }
  ]
});

module.exports = TripVote;
