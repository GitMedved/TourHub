const http = require('http');

const app = require('./app');

const sequelize = require('./config/database');

const {
  initSocket
} = require('./socket');

const PORT = process.env.PORT || 5001;

async function start() {

  try {

    await sequelize.authenticate();

    console.log('Database connected');

    await sequelize.sync({
      alter: true
    });

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });

  } catch (error) {

    console.error(
      'Startup error:',
      error
    );

    process.exit(1);
  }
}

start();
