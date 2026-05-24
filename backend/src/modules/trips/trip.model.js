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
    type: DataTypes.TEXT
  },

  destination: {
    type: DataTypes.STRING
  },

  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  startDate: {
    type: DataTypes.DATE
  },

  endDate: {
    type: DataTypes.DATE
  },

  status: {
    type: DataTypes.ENUM(
      'planning',
      'active',
      'completed',
      'archived'
    ),
    defaultValue: 'planning'
  },

  telegramGroupId: {
    type: DataTypes.STRING,
    allowNull: true
  },

  telegramGroupName: {
    type: DataTypes.STRING,
    allowNull: true
  },

  notificationMode: {
    type: DataTypes.ENUM(
      'all',
      'important',
      'off'
    ),
    defaultValue: 'all'
  },

  visibility: {
    type: DataTypes.ENUM(
      'PRIVATE',
      'SHARED',
      'PUBLIC'
    ),
    defaultValue: 'PRIVATE'
  }
});

module.exports = Trip;
