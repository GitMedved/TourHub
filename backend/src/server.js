const app = require('./app');
const sequelize = require('./config/database');
require('./modules/trips/trip.associations');

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('Database connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');

      server.close(async () => {
        await sequelize.close();
        console.log('Shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();
