const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripComment = sequelize.define('TripComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  tripId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  authorId: {
    type: DataTypes.INTEGER
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = TripComment;
