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
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['isActive'] }
  ]
});

User.addHook('beforeCreate', async (user) => {
  if (user.password) {
    user.email = user.email.trim().toLowerCase();
    user.password = await bcrypt.hash(user.password.trim(), 10);
  }
});

User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password.trim(), 10);
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword.trim(), this.password);
};

module.exports = User;
