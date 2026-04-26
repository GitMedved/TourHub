const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    // Проверяем, существует ли админ
    const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
    
    if (!adminExists) {
      // Создаем админа
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true
      });
      
      console.log('✅ Admin user created: admin@example.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

module.exports = initAdmin;
