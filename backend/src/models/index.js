const User = require('./User');
const Seller = require('./Seller');
const Event = require('./Event');
const Booking = require('./Booking');
const Message = require('./Message');
const Review = require('./Review');

// User - Booking
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Seller - Event
Seller.hasMany(Event, { foreignKey: 'sellerId', as: 'events' });
Event.belongsTo(Seller, { foreignKey: 'sellerId', as: 'seller' });

// Seller - Booking
Seller.hasMany(Booking, { foreignKey: 'sellerId', as: 'sellerBookings' });
Booking.belongsTo(Seller, { foreignKey: 'sellerId', as: 'seller' });

// Event - Booking
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Event - Review
Event.hasMany(Review, { foreignKey: 'eventId', as: 'reviews' });
Review.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// User - Review (ДОБАВЛЕНО)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Seller - Review
Seller.hasMany(Review, { foreignKey: 'sellerId', as: 'reviews' });
Review.belongsTo(Seller, { foreignKey: 'sellerId', as: 'seller' });

// Booking - Review
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  User,
  Seller,
  Event,
  Booking,
  Message,
  Review
};
