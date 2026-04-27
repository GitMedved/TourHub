const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversationId: { type: DataTypes.STRING, allowNull: false },
  fromUserId: { type: DataTypes.INTEGER, allowNull: false },
  fromUserName: { type: DataTypes.STRING, allowNull: false },
  fromUserRole: { type: DataTypes.STRING, defaultValue: 'USER' },
  toUserId: { type: DataTypes.INTEGER, allowNull: true },
  toUserName: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  eventId: { type: DataTypes.INTEGER, allowNull: true },
  eventTitle: { type: DataTypes.STRING, allowNull: true },
  read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

module.exports = Message;
