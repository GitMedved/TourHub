const { DataTypes } = require('sequelize');

const sequelize = require('../../config/database');

const TripMember = sequelize.define('TripMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  tripId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM(
      'owner',
      'editor',
      'member',
      'OWNER',
      'EDITOR',
      'VIEWER'
    ),
    defaultValue: 'member',
    allowNull: false
  },

  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tripId', 'userId']
    },
    {
      fields: ['role']
    }
  ]
});

module.exports = TripMember;
