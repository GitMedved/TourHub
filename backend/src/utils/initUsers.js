const User = require('../models/User');
const Seller = require('../models/Seller');
const bcrypt = require('bcryptjs');

async function initUsers() {
  const salt = await bcrypt.genSalt(10);
  
  const users = [
    { email: 'admin@example.com', password: await bcrypt.hash('admin123', salt), firstName: 'Admin', lastName: 'Adminov', role: 'ADMIN', isActive: true },
    { email: 'manager@example.com', password: await bcrypt.hash('manager123', salt), firstName: 'Manager', lastName: 'Managerov', role: 'MANAGER', isActive: true },
    { email: 'seller@example.com', password: await bcrypt.hash('seller123', salt), firstName: 'Seller', lastName: 'Sellerov', role: 'SELLER', isActive: true },
    { email: 'user@example.com', password: await bcrypt.hash('123456', salt), firstName: 'User', lastName: 'Userov', role: 'USER', isActive: true }
  ];

  for (const u of users) {
    const [user, created] = await User.findOrCreate({
      where: { email: u.email },
      defaults: u
    });
    
    if (created) {
      console.log(`Created user: ${u.email} (${u.role})`);
    } else {
      // Обновляем пароль с хешированием
      user.password = u.password;
      user.role = u.role;
      user.isActive = true;
      await user.save();
      console.log(`Updated user: ${u.email} (${u.role})`);
    }
    
    if (u.role === 'SELLER') {
      const [seller, sCreated] = await Seller.findOrCreate({
        where: { userId: user.id },
        defaults: {
          companyName: 'Travel Agency',
          description: 'Professional travel agency',
          phone: '+7 (495) 123-45-67',
          address: 'Moscow, Tverskaya str., 1',
          approved: true,
          moderationStatus: 'approved'
        }
      });
      if (sCreated) console.log(`Created seller profile for ${u.email}`);
    }
  }
  
  console.log('Users initialization complete');
  process.exit(0);
}

initUsers().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
