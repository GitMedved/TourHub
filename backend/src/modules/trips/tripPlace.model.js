const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripPlace = sequelize.define('TripPlace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  address: {
    type: DataTypes.STRING
  },

  lat: {
    type: DataTypes.FLOAT
  },

  lng: {
    type: DataTypes.FLOAT
  },

  voteScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = TripPlace;
