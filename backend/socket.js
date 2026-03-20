import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
let io;

const webUser = new Map();
const appUser = new Map();

function getSocketids(id) {
  return [{ socketId: webUser.get(id) }, { socketId: appUser.get(id) }];
}

/**
 * Emit a remote control event to a target user on all connected platforms.
 * Returns true if at least one socket was found.
 */
function emitToUser(userId, event, data) {
  const sockets = getSocketids(userId);
  let delivered = false;
  sockets.forEach(({ socketId }) => {
    if (socketId) {
      io.to(socketId).emit(event, data);
      delivered = true;
    }
  });
  return delivered;
}

/**
 * Force disconnect all sockets for a given user.
 */
function disconnectUser(userId) {
  const sockets = getSocketids(userId);
  sockets.forEach(({ socketId }) => {
    if (socketId) {
      const sock = io.sockets.sockets.get(socketId);
      if (sock) {
        sock.emit('remote:force-logout', { message: 'You have been logged out by an administrator.' });
        sock.disconnect(true);
      }
    }
  });
  webUser.delete(userId);
  appUser.delete(userId);
}

/**
 * Check if a user is currently connected.
 */
function isUserOnline(userId) {
  return webUser.has(userId) || appUser.has(userId);
}

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const { platform, token } = socket.handshake.query;

    const deocded = jwt.decode(token);

    if (platform === 'app') {
      appUser.set(deocded.id, socket.id);
    }

    if (platform === 'web') {
      webUser.set(deocded.id, socket.id);
    }

    socket.on('shop.approval', (data) => {
      const userTypes = getSocketids(data.id);
      userTypes.forEach(({ socketId }) => {
        if (socketId) {
          io.to(socketId).emit('shop.approved', data);
        }
      });
    });

    socket.on('shop.status', (data) => {
      const userTypes = getSocketids(data.id);
      userTypes.forEach(({ socketId }) => {
        if (socketId) {
          io.to(socketId).emit('shop.status.updated', data);
        }
      });
    });

    socket.on('coach.approval', (data) => {
      const userTypes = getSocketids(data.id);
      userTypes.forEach(({ socketId }) => {
        if (socketId) {
          io.to(socketId).emit('coach.approved', data);
        }
      });
    });

    socket.on('coach.status', (data) => {
      const userTypes = getSocketids(data.id);
      userTypes.forEach(({ socketId }) => {
        if (socketId) {
          io.to(socketId).emit('coach.status.updated', data);
        }
      });
    });

    // Handle location response from agents
    socket.on('remote:location-response', (data) => {
      if (data.requestedBy) {
        emitToUser(data.requestedBy, 'remote:location-update', {
          userId: deocded.id,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle config acknowledgement from agents
    socket.on('remote:config-ack', (data) => {
      if (data.requestedBy) {
        emitToUser(data.requestedBy, 'remote:config-acknowledged', {
          userId: deocded.id,
          commandId: data.commandId,
        });
      }
    });

    socket.on('disconnect', (reason) => {
      webUser.delete(deocded.id);
      appUser.delete(deocded.id);
      console.log(deocded.id, reason);
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please call initializeSocket first.');
  }
  return io;
};

export { emitToUser, disconnectUser, isUserOnline, webUser, appUser };
