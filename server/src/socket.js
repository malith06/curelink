const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config/env');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.CLIENT_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      // Get token from cookies or auth header
      let token = null;
      if (socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        const jwtCookie = cookies.find(c => c.trim().startsWith('jwt='));
        if (jwtCookie) {
          token = jwtCookie.split('=')[1];
        }
      }
      
      if (!token && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join a personal room to receive targeted notifications
    socket.join(`user_${socket.user.id}`);

    socket.on('disconnect', () => {
      // Handle disconnect if needed
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

module.exports = {
  initSocket,
  getIo,
  sendNotificationToUser
};
