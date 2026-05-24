const assert = require('assert');
const { parseCreateTripCommand, parseDateRu } = require('../modules/telegram/telegram.parser');

const d = parseDateRu('01.12.2026');
assert.ok(d instanceof Date);
assert.equal(d.toISOString().slice(0, 10), '2026-12-01');

const minimal = parseCreateTripCommand('/create_trip Поездка в Сочи');
assert.equal(minimal.title, 'Поездка в Сочи');
assert.equal(minimal.startDate, null);

const extended = parseCreateTripCommand('/create_trip Алтай | 12.06.2026 | 20.06.2026');
assert.equal(extended.title, 'Алтай');
assert.equal(extended.startDate.toISOString().slice(0, 10), '2026-06-12');
assert.equal(extended.endDate.toISOString().slice(0, 10), '2026-06-20');

console.log('telegram.parser tests passed');
