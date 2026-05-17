import { io } from 'socket.io-client';

const socket = io(
  process.env.REACT_APP_API_ORIGIN ||
  'http://localhost:5001',
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
