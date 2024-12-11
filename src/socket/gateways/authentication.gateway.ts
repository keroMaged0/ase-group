import { ExtendedError, Socket } from 'socket.io';
import { IjwtPayload } from '../../types/jwt-payload';
import { Utils } from '../../utils';

export const authenticationGateway = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const token = socket.handshake.headers.authorization?.split('Bearer ')[1];
  if (!token) return socket.disconnect(true);
  const payload = Utils.Tokens.verifyToken(token) as IjwtPayload;
  if (!payload) return socket.disconnect(true);
  socket.data.loggedUser = {
    id: payload.id,
    is_verified: payload.is_verified,
    role_id: payload.role_id,
    user_type: +payload.user_type,
    provider_id: payload.provider_id,
    profile_id: payload.profile_id,
  };
  socket.join([payload.id, payload.provider_id]);
  next();
};
