// Backward-compatible database entry point.
// Some local/dev entry files import `./config/db`; the canonical Sequelize
// instance lives in `./database` and should remain the single source of truth.
module.exports = require('./database');
