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
    allowNull: false,
    validate: {
      min: -1,
      max: 1
    }
  }
});

module.exports = TripVote;
