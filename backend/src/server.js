const http = require('http');

const app = require('./app');

const sequelize = require('./config/database');

const {
  initSocket
} = require('./socket');

/*
|--------------------------------------------------------------------------
| IMPORT ALL MODELS
|--------------------------------------------------------------------------
*/

require('./models/User');
require('./models/Event');
require('./models/Booking');
require('./models/Review');
require('./models/Message');
require('./models/Seller');
require('./models/Wishlist');

/*
|--------------------------------------------------------------------------
| IMPORT TRIPS MODULE
|--------------------------------------------------------------------------
*/

require('./modules/trips/trip.associations');

const PORT = process.env.PORT || 5001;

function listen(server, port) {

  return new Promise((resolve, reject) => {

    const handleError = (error) => {

      reject(error);
    };

    server.once(
      'error',
      handleError
    );

    server.listen(port, () => {

      server.off(
        'error',
        handleError
      );

      resolve();
    });
  });
}

function printStartupError(error) {

  if (error.code === 'EADDRINUSE') {

    console.error(
      `Port ${PORT} is already in use.`
    );

    console.error(
      'Stop the process that is using this port, or start TourHub with another port:'
    );

    console.error(
      '  PORT=5002 npm start'
    );

    console.error(
      `To find the process on macOS/Linux, run: lsof -i :${PORT}`
    );

    return;
  }

  console.error(
    'Startup error:',
    error
  );
}

async function start() {

  try {

    await sequelize.authenticate();

    console.log('Database connected');

    await sequelize.sync({
      alter: true
    });

    const server = http.createServer(app);

    initSocket(server);

    await listen(
      server,
      PORT
    );

    console.log(
      `Server running on port ${PORT}`
    );

  } catch (error) {

    printStartupError(error);

    process.exit(1);
  }
}

start();
