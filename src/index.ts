import './config/firebase';
import './config/s3';
import { createServer } from 'http';

import { Server } from 'socket.io';

import { app } from './app';
import { env } from './config/env';
import { initializeSocket } from './socket/initialize';
import { initializeDB } from './config/typeorm';

const start = async () => {
  const server = createServer(app);
  await initializeDB();
  server.listen(env.port, () => {
    console.log(`server is running on port ${env.port} in envronment ${env.environment}`);
  });

  const io = new Server(server, {
    cors: { origin: env.frontUrl },
    transports: ['websocket'],
  });
  initializeSocket(io);
  app.set('socket', io);
};

start();
