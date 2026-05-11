const { Server } = require('socket.io');

let io;

function initSocket(server) {

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {

    console.log('Socket connected:', socket.id);

    socket.on('trip:join', (tripId) => {

      socket.join(`trip:${tripId}`);

      console.log(
        `Socket ${socket.id} joined trip:${tripId}`
      );
    });

    socket.on('trip:leave', (tripId) => {

      socket.leave(`trip:${tripId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

  });

  return io;
}

function getIO() {

  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
}

module.exports = {
  initSocket,
  getIO
};
