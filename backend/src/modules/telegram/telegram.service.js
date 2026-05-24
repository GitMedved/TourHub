const crypto = require('crypto');

const { User } = require('../../models');
const { Trip, TripMember } = require('../trips/trip.associations');
const tripService = require('../trips/trip.service');

const randomPassword = () => crypto.randomBytes(24).toString('hex');

const ensureTelegramUser = async (telegramUser) => {
  const telegramId = String(telegramUser.id);
  let user = await User.findOne({ where: { telegramId } });
  if (user) return user;

  const username = telegramUser.username || `tg_${telegramId}`;
  const email = `${username.toLowerCase()}_${telegramId}@telegram.tourhub.local`;

  user = await User.create({
    email,
    password: randomPassword(),
    firstName: telegramUser.first_name || 'Telegram',
    lastName: telegramUser.last_name || 'User',
    telegramId,
    telegramUsername: telegramUser.username || null,
    telegramPhotoUrl: null,
    authProvider: 'telegram',
    role: 'USER'
  });

  return user;
};

const createTripFromTelegram = async ({ telegramUser, group, title, startDate, endDate }) => {
  const user = await ensureTelegramUser(telegramUser);
  const trip = await tripService.createTrip({
    title,
    startDate,
    endDate,
    telegramGroupId: String(group.id),
    telegramGroupName: group.title || 'Telegram Group',
    notificationMode: 'all'
  }, user.id);

  await TripMember.findOrCreate({
    where: { tripId: trip.id, userId: user.id },
    defaults: { role: 'owner', joinedVia: 'telegram' }
  });

  return trip;
};

const listGroupTrips = async (groupId) => Trip.findAll({
  where: { telegramGroupId: String(groupId) },
  order: [['createdAt', 'DESC']],
  limit: 10
});

module.exports = {
  ensureTelegramUser,
  createTripFromTelegram,
  listGroupTrips
};
