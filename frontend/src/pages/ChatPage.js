import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const ChatPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (bookingId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      // Пробуем получить сообщения через API бронирования
      const res = await api.get(`/messages/booking/${bookingId}`);
      if (res.data) {
        setMessages(res.data.messages || []);
        setBooking(res.data.booking || null);
      }
    } catch (e) {
      try {
        // Запасной вариант - через чат с менеджером
        const res2 = await api.get(`/messages/chat/${user.id}`);
        if (res2.data) {
          setMessages(Array.isArray(res2.data) ? res2.data : []);
        }
      } catch (e2) {
        console.log('Нет сообщений');
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Пробуем отправить через API бронирования
      await api.post(`/messages/booking/${bookingId}`, { text: newMessage });
      setNewMessage('');
      loadMessages();
    } catch (e) {
      try {
        // Запасной вариант - отправить менеджеру
        await api.post('/messages/to-manager', { 
          message: `[Бронирование #${bookingId}] ${newMessage}` 
        });
        setNewMessage('');
        
        // Добавляем сообщение локально
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: newMessage,
          fromUserId: user.id,
          createdAt: new Date().toISOString()
        }]);
        toast.success('Сообщение отправлено');
      } catch (e2) {
        toast.error('Не удалось отправить');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Заголовок чата */}
          <div className="bg-white rounded-t-2xl shadow-sm px-6 py-4 flex items-center gap-4 border-b">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="font-semibold">
                {booking ? `Чат: ${booking.eventTitle || 'Бронирование'}` : `Чат #${bookingId}`}
              </h2>
              <p className="text-sm text-gray-500">
                {booking?.status === 'CONFIRMED' ? 'Подтверждено' : 'В обработке'}
              </p>
            </div>
          </div>

          {/* Сообщения */}
          <div className="bg-white shadow-sm px-6 py-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-lg font-medium text-gray-600">Начните общение</p>
                <p className="text-sm">Напишите сообщение по бронированию</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => {
                  const isMine = msg.fromUserId === user.id || msg.senderId === user.id;
                  return (
                    <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isMine 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.text || msg.message}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Отправка сообщения */}
          <form onSubmit={sendMessage} className="bg-white rounded-b-2xl shadow-sm px-6 py-4 border-t flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white rounded-xl px-5 py-3 hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
