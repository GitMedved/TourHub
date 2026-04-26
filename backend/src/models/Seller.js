const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Seller = sequelize.define('Seller', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  inn: DataTypes.STRING,
  ogrn: DataTypes.STRING,
  approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  moderationStatus: { type: DataTypes.STRING, defaultValue: 'pending' }
}, { timestamps: true });

Seller.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Seller, { foreignKey: 'userId' });

module.exports = Seller;
