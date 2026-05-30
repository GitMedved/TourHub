import { io } from 'socket.io-client';
import { API_ORIGIN } from './config/api';

const socket = io(
  API_ORIGIN,
  {
    autoConnect: false,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: (callback) => {
      callback({
        token: localStorage.getItem('token')
      });
    }
  }
);

export default socket;
