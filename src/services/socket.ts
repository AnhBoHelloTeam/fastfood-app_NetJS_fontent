import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token'),
  },
});

socket.on('connect', () => {
  console.log('Kết nối WebSocket thành công');
});

socket.on('disconnect', () => {
  console.log('Ngắt kết nối WebSocket');
});

export { socket };