import React, {
  useEffect,
  useState
} from 'react';

import {
  useParams
} from 'react-router-dom';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import socket from '../../socket';

import {
  getTrips,
  addPlace,
  addComment,
  voteForPlace,
  createInvite
} from './trips.api';

export default function TripWorkspacePage() {

  const { id } = useParams();

  const socketInstance = socket;

  const queryClient =
    useQueryClient();

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [typingUser, setTypingUser] =
    useState(null);

  const [placeForm, setPlaceForm] =
    useState({
      title: '',
      description: ''
    });

  const [comment, setComment] =
    useState('');

  const [currentUser] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem('user')
      );

    } catch {

      return null;
    }
  });

  const {
    data: trips = [],
    isLoading
  } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });

  const trip = trips.find(
    (item) =>
      String(item.id) === String(id)
  );

  useEffect(() => {

    if (!id || !currentUser) {
      return undefined;
    }

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    socketInstance.emit('subscribe:trips', {
      tripIds: [id]
    });

    const handlePresence = (
      users
    ) => {

      setOnlineUsers(users);
    };

    const handleTyping = (
      user
    ) => {

      setTypingUser(user);

      setTimeout(() => {

        setTypingUser(null);

      }, 2000);
    };

    const refreshTrips = (event) => {

      if (
        event?.tripId &&
        String(event.tripId) !== String(id)
      ) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      queryClient.invalidateQueries({
        queryKey: ['trip', id]
      });
    };

    socketInstance.off(
      'trip:presence',
      handlePresence
    );

    socketInstance.off(
      'trip:userTyping',
      handleTyping
    );

    socketInstance.off(
      'place:added',
      refreshTrips
    );

    socketInstance.off(
      'comment:added',
      refreshTrips
    );

    socketInstance.off(
      'place:voted',
      refreshTrips
    );

    socketInstance.on(
      'trip:presence',
      handlePresence
    );

    socketInstance.on(
      'trip:userTyping',
      handleTyping
    );

    socketInstance.on(
      'place:added',
      refreshTrips
    );

    socketInstance.on(
      'comment:added',
      refreshTrips
    );

    socketInstance.on(
      'place:voted',
      refreshTrips
    );

    return () => {

      socketInstance.emit('unsubscribe:trips', {
        tripIds: [id]
      });

      socketInstance.off(
        'trip:presence',
        handlePresence
      );

      socketInstance.off(
        'trip:userTyping',
        handleTyping
      );

      socketInstance.off(
        'place:added',
        refreshTrips
      );

      socketInstance.off(
        'comment:added',
        refreshTrips
      );

      socketInstance.off(
        'place:voted',
        refreshTrips
      );
    };

  }, [id, currentUser, queryClient, socketInstance]);

  const addPlaceMutation =
    useMutation({

      mutationFn: (data) =>
        addPlace(id, data),

      onSuccess: () => {

        setPlaceForm({
          title: '',
          description: ''
        });
      }
    });

  const addCommentMutation =
    useMutation({

      mutationFn: (data) =>
        addComment(id, data),

      onSuccess: () => {

        setComment('');
      }
    });

  const voteMutation =
    useMutation({

      mutationFn: ({
        placeId,
        value
      }) =>
        voteForPlace(
          placeId,
          value
        )
    });

  const inviteMutation =
    useMutation({

      mutationFn: () =>
        createInvite(id)
    });

  if (isLoading) {

    return (
      <div className="p-8">
        Загрузка...
      </div>
    );
  }

  if (!trip) {

    return (
      <div className="p-8">
        Поездка не найдена
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">

          <div className="flex items-start justify-between">

            <div>

              <h1 className="text-5xl font-bold">
                {trip.title}
              </h1>

              <p className="text-gray-500 mt-3">
                {trip.destination}
              </p>

            </div>

            <button
              onClick={async () => {

                const result =
                  await inviteMutation.mutateAsync();

                await navigator.clipboard.writeText(
                  result.inviteUrl
                );

                alert('Ссылка-приглашение скопирована');
              }}
              className="bg-black text-white px-5 py-3 rounded-2xl"
            >
              Пригласить
            </button>

          </div>

          <div className="mt-6">

            <div className="text-sm text-gray-400 mb-2">
              Участники онлайн
            </div>

            <div className="flex gap-2 flex-wrap">

              {onlineUsers.map(
                (user) => (

                  <div
                    key={user.id}
                    className="
                      px-3
                      py-2
                      bg-green-100
                      rounded-xl
                    "
                  >
                    {user.firstName}
                  </div>
                )
              )}

            </div>

            {typingUser && (

              <div className="mt-3 text-sm text-gray-500">
                {typingUser.firstName} печатает...
              </div>
            )}

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">

            <div className="bg-white rounded-3xl shadow-sm p-6">

              <h2 className="text-3xl font-bold mb-6">
                Места
              </h2>

              <form
                onSubmit={(e) => {

                  e.preventDefault();

                  addPlaceMutation.mutate(
                    placeForm
                  );
                }}
                className="space-y-4 mb-8"
              >

                <input
                  type="text"
                  placeholder="Название места"
                  value={placeForm.title}
                  onChange={(e) =>
                    setPlaceForm({
                      ...placeForm,
                      title:
                        e.target.value
                    })
                  }
                  className="w-full border p-4 rounded-2xl"
                  required
                />

                <textarea
                  placeholder="Описание"
                  value={placeForm.description}
                  onChange={(e) =>
                    setPlaceForm({
                      ...placeForm,
                      description:
                        e.target.value
                    })
                  }
                  className="w-full border p-4 rounded-2xl"
                />

                <button
                  type="submit"
                  className="bg-black text-white px-5 py-3 rounded-2xl"
                >
                  Добавить место
                </button>

              </form>

              <div className="space-y-4">

                {trip.places?.map(
                  (place) => (

                    <div
                      key={place.id}
                      className="border rounded-2xl p-5"
                    >

                      <div className="flex justify-between">

                        <div>

                          <h3 className="text-2xl font-semibold">
                            {place.title}
                          </h3>

                          <p className="text-gray-500 mt-2">
                            {place.description}
                          </p>

                        </div>

                        <div className="flex flex-col gap-2">

                          <button
                            onClick={() =>
                              voteMutation.mutate({
                                placeId:
                                  place.id,
                                value: 1
                              })
                            }
                          >
                            👍
                          </button>

                          <button
                            onClick={() =>
                              voteMutation.mutate({
                                placeId:
                                  place.id,
                                value: -1
                              })
                            }
                          >
                            👎
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          <div>

            <div className="bg-white rounded-3xl shadow-sm p-6">

              <h2 className="text-3xl font-bold mb-6">
                Комментарии
              </h2>

              <form
                onSubmit={(e) => {

                  e.preventDefault();

                  addCommentMutation.mutate({
                    content: comment
                  });
                }}
              >

                <textarea
                  value={comment}
                  onChange={(e) => {

                    setComment(
                      e.target.value
                    );

                    socketInstance.emit(
                      'trip:typing',
                      {
                        tripId: id,
                        user: currentUser
                      }
                    );
                  }}
                  placeholder="Напишите комментарий..."
                  className="w-full border p-4 rounded-2xl"
                />

                <button
                  type="submit"
                  className="mt-4 bg-black text-white px-5 py-3 rounded-2xl"
                >
                  Отправить
                </button>

              </form>

              <div className="space-y-4 mt-6">

                {trip.comments?.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="bg-gray-50 p-4 rounded-2xl"
                    >

                      <div className="text-sm text-gray-400 mb-2">

                        {item.author?.firstName ||
                          'Пользователь'}

                      </div>

                      <div>
                        {item.content}
                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
