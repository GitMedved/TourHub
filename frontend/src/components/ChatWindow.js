import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, getMessages } from '../api/messages';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ChatWindow = ({ bookingId, currentUserId, participant }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => getMessages(bookingId),
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text) => sendMessage(bookingId, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', bookingId]);
      setNewMessage('');
    },
    onError: (error) => {
      toast.error('Не удалось отправить сообщение');
      console.error('Send message error:', error);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Ошибка загрузки сообщений: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md">
      <div className="bg-white border-b px-6 py-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Чат с {participant?.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Событие: {data?.booking?.eventTitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data?.messages?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Начните диалог первым
          </div>
        ) : (
          data?.messages?.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="break-words">{message.text}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.senderId === currentUserId
                      ? 'text-blue-200'
                      : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.created_at), 'HH:mm, dd MMM', {
                    locale: ru
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t bg-white p-4 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessageMutation.isPending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
