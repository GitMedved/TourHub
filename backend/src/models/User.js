const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  companyName: DataTypes.STRING,
  phone: DataTypes.STRING,
  avatar: DataTypes.STRING,
  lastLogin: DataTypes.DATE
}, { timestamps: true });

User.beforeCreate = async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
};

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

User.hasMany(require('./Booking'), { foreignKey: 'userId' });

User.hasMany(require('./Booking'), { foreignKey: 'userId' });
