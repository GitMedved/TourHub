import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUser, FaHeadset, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadMessages(parsedUser);
  }, []);

  const loadMessages = async (userData) => {
    try {
      const response = await api.get(`/messages/chat/${userData.id}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Автообновление каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) loadMessages(user);
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages/to-manager', {
        message: newMessage.trim()
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      
      <div className="flex-1 container mx-auto max-w-3xl px-4 py-4 flex flex-col">
        {/* Заголовок чата */}
        <div className="bg-white rounded-t-xl shadow-sm p-4 flex items-center gap-3 border-b">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
            <FaHeadset className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Поддержка TravelHub</h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Онлайн • Отвечаем быстро
            </p>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaHeadset className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Чат с поддержкой</h3>
              <p className="text-sm text-center max-w-xs">
                Задайте любой вопрос о событиях, бронированиях или работе сервиса
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Определяем, моё ли сообщение (от пользователя) или от менеджера
              const isMyMessage = msg.fromUserRole !== 'MANAGER' && msg.fromUserRole !== 'ADMIN';
              
              // Показываем разделитель даты при смене дня
              const showDateHeader = index === 0 || 
                new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();
              
              // Проверяем, есть ли контекст события
              const hasEventContext = msg.eventTitle && msg.message?.startsWith('Вопрос по событию');
              
              return (
                <div key={msg.id}>
                  {showDateHeader && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 text-gray-500 text-xs px-4 py-1 rounded-full font-medium">
                        {formatDateHeader(msg.createdAt)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                      {/* Аватар */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isMyMessage 
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                          : 'bg-gradient-to-br from-green-400 to-green-600'
                      }`}>
                        {isMyMessage 
                          ? <span className="text-white text-xs font-medium">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                          : <FaHeadset className="text-white text-sm" />
                        }
                      </div>
                      
                      {/* Пузырь сообщения */}
                      <div>
                        {hasEventContext && (
                          <div className={`text-xs mb-1 px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isMyMessage ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                          }`}>
                            <FaCalendarAlt className="text-xs" />
                            {msg.eventTitle}
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMyMessage 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          {msg.message}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                          {isMyMessage && msg.read && (
                            <span className="text-xs text-blue-400">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <form onSubmit={sendMessage} className="bg-white rounded-b-xl shadow-sm border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 border-2 border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-blue-400 transition text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FaPaperPlane className="text-lg" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
