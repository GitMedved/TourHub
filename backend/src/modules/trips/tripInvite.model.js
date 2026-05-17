const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripInvite = sequelize.define('TripInvite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  token: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false
  },

  tripId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  createdById: {
    type: DataTypes.INTEGER
  },

  maxUses: {
    type: DataTypes.INTEGER
  },

  useCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },

  expiresAt: {
    type: DataTypes.DATE
  },

  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  invitedBy: {
    type: DataTypes.INTEGER
  },

  usedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'trip_invites'
});

module.exports = TripInvite;
