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

const DEFAULT_PORT = 5001;
const PORT = Number(process.env.PORT || DEFAULT_PORT);
const MAX_AUTO_PORT_ATTEMPTS = Number(process.env.MAX_AUTO_PORT_ATTEMPTS || 10);

const isDefaultPort = !process.env.PORT;

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

function isPortInUse(error) {

  return error.code === 'EADDRINUSE';
}

async function listenWithFallback(server, preferredPort) {

  let port = preferredPort;

  for (let attempt = 0; attempt <= MAX_AUTO_PORT_ATTEMPTS; attempt += 1) {

    try {

      await listen(
        server,
        port
      );

      return port;

    } catch (error) {

      const canTryNextPort =
        isDefaultPort &&
        isPortInUse(error) &&
        attempt < MAX_AUTO_PORT_ATTEMPTS;

      if (!canTryNextPort) {

        error.port = port;
        throw error;
      }

      console.warn(
        `Port ${port} is already in use. Trying port ${port + 1}...`
      );

      port += 1;
    }
  }

  return port;
}

function printStartupError(error) {

  if (isPortInUse(error)) {

    const port = error.port || PORT;

    console.error(
      `Port ${port} is already in use.`
    );

    console.error(
      'Stop the process that is using this port, or start TourHub with another port:'
    );

    console.error(
      '  PORT=5002 npm start'
    );

    console.error(
      `To find the process on macOS/Linux, run: lsof -i :${port}`
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

    const actualPort = await listenWithFallback(
      server,
      PORT
    );

    console.log(
      `Server running on port ${actualPort}`
    );

    if (actualPort !== PORT) {

      console.log(
        `Frontend API URL for this session: REACT_APP_API_URL=http://localhost:${actualPort}/api`
      );
    }

  } catch (error) {

    printStartupError(error);

    process.exit(1);
  }
}

start();
