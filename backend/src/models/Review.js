const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventRating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  sellerRating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: false },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  eventId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  bookingId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true,
  indexes: [
    { fields: ['eventId', 'isApproved'] },
    { fields: ['sellerId', 'isApproved'] },
    { fields: ['bookingId'], unique: true },
    { fields: ['userId'] }
  ]
});

module.exports = Review;
