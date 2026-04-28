import api from './axios';

export const getMessages = async (bookingId) => {
  const response = await api.get(`/messages/booking/${bookingId}`);
  return response.data;
};

export const sendMessage = async (bookingId, text) => {
  const response = await api.post(`/messages/booking/${bookingId}`, { text });
  return response.data;
};

export const getMyChats = async () => {
  const response = await api.get('/messages/my-chats');
  return response.data;
};
