import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL || undefined, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
