const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripMember = sequelize.define('TripMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  role: {
    type: DataTypes.ENUM(
      'OWNER',
      'EDITOR',
      'VIEWER'
    ),
    defaultValue: 'VIEWER'
  }
});

module.exports = TripMember;
