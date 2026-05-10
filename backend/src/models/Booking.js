const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingNumber: { type: DataTypes.STRING, unique: true },
  participants: { type: DataTypes.INTEGER, allowNull: false },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'CREATED' },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'UNPAID' },
  contactName: DataTypes.STRING,
  contactPhone: DataTypes.STRING,
  contactEmail: DataTypes.STRING,
  specialRequests: DataTypes.TEXT,
  eventDate: { type: DataTypes.DATE, allowNull: false },
  confirmedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE,
  cancelledAt: DataTypes.DATE,
  cancellationReason: DataTypes.TEXT,
  userId: { type: DataTypes.INTEGER, allowNull: false },
  eventId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: DataTypes.INTEGER
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['eventId'] },
    { fields: ['sellerId'] },
    { fields: ['status'] },
    { fields: ['bookingNumber'] }
  ]
});

module.exports = Booking;
