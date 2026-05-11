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
    type: DataTypes.TEXT,
    allowNull: true
  },

  address: {
    type: DataTypes.STRING,
    allowNull: true
  },

  lat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  lng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  dayNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  estimatedCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  voteScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = TripPlace;
