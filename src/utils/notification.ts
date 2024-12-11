import { Server } from 'socket.io';

export interface InotifyOptions {
  io: Server;
  to: string[];
  title: string;
  body: string;
  target_id?: string;
  model_ref?: string;
  event?: string;
}
export const notify = async (options: InotifyOptions) => {
  const { title, body, target_id, model_ref } = options;
  options.io.to(options.to).emit('notification', { title, body, target_id, model_ref });
  // TODO: save notificatin at db
};
