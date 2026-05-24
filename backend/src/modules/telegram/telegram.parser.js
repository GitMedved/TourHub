const CREATE_TRIP_CMD = /^\/create_trip\s+(.+)$/i;

const parseDateRu = (input) => {
  const match = String(input || '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseCreateTripCommand = (text) => {
  const match = String(text || '').trim().match(CREATE_TRIP_CMD);
  if (!match) return null;

  const payload = match[1].split('|').map((part) => part.trim()).filter(Boolean);
  const title = payload[0];
  if (!title) return null;

  const startDate = payload[1] ? parseDateRu(payload[1]) : null;
  const endDate = payload[2] ? parseDateRu(payload[2]) : null;

  return {
    title,
    startDate,
    endDate
  };
};

module.exports = {
  parseDateRu,
  parseCreateTripCommand
};
