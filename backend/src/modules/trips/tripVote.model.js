const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripVote = sequelize.define('TripVote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = TripVote;
