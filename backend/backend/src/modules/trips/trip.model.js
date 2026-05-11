const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Trip = sequelize.define('Trip', {
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

  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },

  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  visibility: {
    type: DataTypes.ENUM('PRIVATE', 'SHARED', 'PUBLIC'),
    defaultValue: 'PRIVATE'
  },

  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },

  budget: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
});

module.exports = Trip;
