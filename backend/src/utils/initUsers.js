const User = require('../models/User');
const Seller = require('../models/Seller');

async function initUsers() {
  const users = [
    { email: 'admin@example.com', password: 'admin123', firstName: 'Admin', lastName: 'Adminov', role: 'ADMIN', isActive: true },
    { email: 'manager@example.com', password: 'manager123', firstName: 'Manager', lastName: 'Managerov', role: 'MANAGER', isActive: true },
    { email: 'seller@example.com', password: 'seller123', firstName: 'Seller', lastName: 'Sellerov', role: 'SELLER', isActive: true },
    { email: 'user@example.com', password: '123456', firstName: 'Regular', lastName: 'User', role: 'USER', isActive: true }
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });

    if (!existing) {
      await User.create(u);
      console.log(`Created: ${u.email} (${u.role})`);
    } else {
      existing.password = u.password;
      existing.role = u.role;
      existing.isActive = true;
      await existing.save();
      console.log(`Updated: ${u.email} (${u.role})`);
    }

    if (u.role === 'SELLER') {
      const user = await User.findOne({ where: { email: u.email } });
      await Seller.findOrCreate({
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
    }
  }

  console.log('Done');
  process.exit(0);
}

initUsers().catch(err => { console.error(err); process.exit(1); });
