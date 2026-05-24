const { parseCreateTripCommand } = require('./telegram.parser');
const telegramService = require('./telegram.service');

const botBase = process.env.TELEGRAM_BOT_LINK || 'https://t.me/your_bot';
const webBase = process.env.CLIENT_URL || 'http://localhost:3000';

const markdown = (res, text, extra = {}) => res.json({
  method: 'sendMessage',
  chat_id: extra.chatId,
  text,
  parse_mode: 'Markdown',
  ...extra
});

const telegramWebhook = async (req, res, next) => {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
      return res.status(403).json({ ok: false, message: 'Forbidden webhook source' });
    }

    const msg = req.body?.message;
    if (!msg?.text?.startsWith('/')) return res.status(200).json({ ok: true, ignored: true });

    const chatId = msg.chat?.id;
    const from = msg.from;
    const command = msg.text.trim();

    if (/^\/help/i.test(command)) {
      return markdown(res, '*TourHub Bot*\nДоступные команды: /create_trip, /trip, /trips, /add_place, /places, /vote, /comment, /invite, /notifications', { chatId });
    }

    if (/^\/create_trip/i.test(command)) {
      const parsed = parseCreateTripCommand(command);
      if (!parsed) {
        return markdown(res, 'Не удалось разобрать команду. Формат: `/create_trip Название | дд.мм.гггг | дд.мм.гггг`', { chatId });
      }

      const trip = await telegramService.createTripFromTelegram({
        telegramUser: from,
        group: msg.chat,
        ...parsed
      });

      const text = `*Trip создан*\n*${trip.title}*\nID: \`${trip.id}\`\n[Открыть на TourHub](${webBase}/trips/${trip.id})`;
      return markdown(res, text, { chatId });
    }

    if (/^\/trips/i.test(command)) {
      const trips = await telegramService.listGroupTrips(chatId);
      if (!trips.length) {
        return markdown(res, 'Пока нет активных Trip для этой группы.', { chatId });
      }

      const lines = trips.map((trip) => `• *${trip.title}* (ID: \`${trip.id}\`)`);
      return markdown(res, `*Trip этой группы:*\n${lines.join('\n')}`, { chatId });
    }

    return markdown(res, `Команда не реализована в MVP. Используйте /help или откройте ${botBase}`, { chatId });
  } catch (error) {
    return next(error);
  }
};

module.exports = { telegramWebhook };
