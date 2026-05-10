const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  eventId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['eventId'] },
    { fields: ['userId', 'eventId'], unique: true }
  ]
});

module.exports = Wishlist;
