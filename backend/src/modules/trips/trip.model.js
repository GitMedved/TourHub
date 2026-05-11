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
    type: DataTypes.STRING,
    allowNull: false
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
