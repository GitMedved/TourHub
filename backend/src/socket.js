const { Server } = require('socket.io');

let io;

const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {

    console.log(
      `Socket connected: ${socket.id}`
    );

    socket.on('joinTrip', (tripId) => {

      const room = `trip:${tripId}`;

      socket.join(room);

      console.log(
        `Socket ${socket.id} joined ${room}`
      );
    });

    socket.on('disconnect', () => {

      console.log(
        `Socket disconnected: ${socket.id}`
      );
    });
  });

  return io;
};

const getIO = () => {

  if (!io) {
    throw new Error(
      'Socket.io not initialized'
    );
  }

  return io;
};

module.exports = {
  initSocket,
  getIO
};