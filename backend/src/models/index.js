const Event = require('./Event');
const Booking = require('./Booking');
const User = require('./User');
const Seller = require('./Seller');
const Message = require('./Message');
const Review = require('./Review');

Booking.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Booking, { foreignKey: 'eventId' });

Booking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Booking, { foreignKey: 'userId' });

Seller.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Seller, { foreignKey: 'userId' });

Event.belongsTo(Seller, { foreignKey: 'sellerId' });
Seller.hasMany(Event, { foreignKey: 'sellerId' });

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Event, { foreignKey: 'eventId' });
Review.belongsTo(Seller, { foreignKey: 'sellerId' });

module.exports = { Event, Booking, User, Seller, Message, Review };
