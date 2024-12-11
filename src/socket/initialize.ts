import { Server, Socket } from 'socket.io';
import { authenticationGateway } from './gateways/authentication.gateway';

export const initializeSocket = (io: Server) => {
  io.use(authenticationGateway);
  io.on('connection', (socket: Socket) => {
    socket.on('disconnect', () => {});
  });
};
