import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
let io;

const webUser = new Map();
const appUser = new Map();

function getSocketids(id) {
  return [{ socketId: webUser.get(id) }, { socketId: appUser.get(id) }];
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
