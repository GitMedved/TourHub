const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { getJwtSecret } = require('./config/env');
const { TripMember } = require('./modules/trips/trip.associations');

let io;
const connectionBuckets = new Map();

const canConnectFromIp = (ip) => {
  const now = Date.now();
  const windowMs = 1000;
  const maxPerWindow = 10;
  const bucket = connectionBuckets.get(ip) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= maxPerWindow) {
    connectionBuckets.set(ip, recent);
    return false;
  }

  recent.push(now);
  connectionBuckets.set(ip, recent);
  return true;
};

const normalizeTripIds = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.tripIds)) {
    return payload.tripIds;
  }

  if (payload?.tripId) {
    return [payload.tripId];
  }

  if (typeof payload === 'string') {
    return [payload];
  }

  return [];
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    try {
      const ip = socket.handshake.address || 'unknown';

      if (!canConnectFromIp(ip)) {
        return next(new Error('Too many socket connections'));
      }

      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication failed'));
      }

      socket.user = jwt.verify(token, getJwtSecret());
      return next();
    } catch (error) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const subscribeToTrips = async (payload) => {
      try {
        const tripIds = [...new Set(normalizeTripIds(payload).map(String))];

        await Promise.all(tripIds.map(async (tripId) => {
          const membership = await TripMember.findOne({
            where: {
              tripId,
              userId: socket.user.id
            }
          });

          if (!membership) {
            return;
          }

          const room = `trip:${tripId}`;

          if (!socket.rooms.has(room)) {
            socket.join(room);
            console.log(`Socket ${socket.id} joined ${room}`);
          }
        }));
      } catch (error) {
        console.error('Socket subscribe failed:', error);
        socket.emit('socket:error', {
          error: 'SUBSCRIBE_FAILED',
          message: 'Unable to subscribe to trip updates'
        });
      }
    };

    const unsubscribeFromTrips = (payload) => {
      try {
        const tripIds = [...new Set(normalizeTripIds(payload).map(String))];

        tripIds.forEach((tripId) => {
          const room = `trip:${tripId}`;

          if (socket.rooms.has(room)) {
            socket.leave(room);
          }
        });
      } catch (error) {
        console.error('Socket unsubscribe failed:', error);
      }
    };

    socket.on('subscribe:trips', subscribeToTrips);
    socket.on('unsubscribe:trips', unsubscribeFromTrips);

    // Backward-compatible aliases for older UI code.
    socket.on('joinTrip', (tripId) => subscribeToTrips({ tripIds: [tripId] }));
    socket.on('trip:join', (payload) => subscribeToTrips({ tripIds: [payload?.tripId] }));

    socket.on('trip:typing', (payload) => {
      try {
        if (!payload?.tripId) {
          return;
        }

        socket
          .to(`trip:${payload.tripId}`)
          .emit('trip:userTyping', payload.user);
      } catch (error) {
        console.error('Socket typing failed:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};

module.exports = {
  initSocket,
  getIO
};
