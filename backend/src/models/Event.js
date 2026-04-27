const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  shortDescription: DataTypes.STRING(500),
  fullDescription: DataTypes.TEXT,
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  priceInfo: DataTypes.STRING,
  address: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
  previewImage: DataTypes.STRING,
  images: { type: DataTypes.JSON, defaultValue: [] },
  videoUrl: DataTypes.STRING,
  category: { type: DataTypes.STRING, defaultValue: 'other' },
  subcategory: { type: DataTypes.STRING, defaultValue: 'other' },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  durationDays: { type: DataTypes.INTEGER, defaultValue: 1 },
  maxParticipants: { type: DataTypes.INTEGER, defaultValue: 10 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  moderationStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  moderationComment: DataTypes.TEXT,
  rating: { type: DataTypes.DECIMAL(3, 1), defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  sellerId: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: true });

module.exports = Event;
