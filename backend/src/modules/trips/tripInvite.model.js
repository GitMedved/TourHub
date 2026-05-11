const {
  DataTypes
} = require('sequelize');

const sequelize =
  require('../../config/database');

const TripInvite = sequelize.define('TripInvite', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  tripId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  invitedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },

  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'trip_invites'
});

module.exports = TripInvite;
