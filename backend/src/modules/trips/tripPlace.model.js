const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripPlace = sequelize.define('TripPlace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  tripId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  addedById: {
    type: DataTypes.INTEGER
  },

  name: {
    type: DataTypes.STRING
  },

  title: {
    type: DataTypes.STRING
  },

  description: {
    type: DataTypes.TEXT
  },

  address: {
    type: DataTypes.STRING
  },

  latitude: {
    type: DataTypes.FLOAT
  },

  longitude: {
    type: DataTypes.FLOAT
  },

  lat: {
    type: DataTypes.FLOAT
  },

  lng: {
    type: DataTypes.FLOAT
  },

  notes: {
    type: DataTypes.TEXT
  },

  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  voteScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = TripPlace;
