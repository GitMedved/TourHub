const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fromUserName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fromUserRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  toUserName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  conversationId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  eventTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'messages',
  timestamps: true
});

module.exports = Message;
