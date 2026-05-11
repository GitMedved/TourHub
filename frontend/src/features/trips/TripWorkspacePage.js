import React, { useState } from 'react';

import {
  useParams
} from 'react-router-dom';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  getTrips,
  addPlace,
  addComment,
  voteForPlace
} from './trips.api';

export default function TripWorkspacePage() {

  const { id } = useParams();

  const queryClient = useQueryClient();

  const [placeForm, setPlaceForm] = useState({
    title: '',
    description: ''
  });

  const [comment, setComment] = useState('');

  const {
    data: trips = [],
    isLoading
  } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });

  const trip = trips.find(
    (item) => String(item.id) === String(id)
  );

  const addPlaceMutation = useMutation({
    mutationFn: (data) => addPlace(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      setPlaceForm({
        title: '',
        description: ''
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => addComment(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      setComment('');
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({
      placeId,
      value
    }) => voteForPlace(placeId, value),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });
    }
  });

  if (isLoading) {
    return (
      <div className="p-8">
        Loading workspace...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8">
        Trip not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-3 mb-3">

                <span className="px-4 py-1 rounded-full bg-black text-white text-sm">
                  collaborative workspace
                </span>

                <span className="px-4 py-1 rounded-full bg-gray-100 text-sm">
                  {trip.visibility}
                </span>

              </div>

              <h1 className="text-5xl font-bold">
                {trip.title}
              </h1>

              <p className="text-gray-500 mt-3 text-lg">
                {trip.destination}
              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-3xl shadow-sm p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-3xl font-bold">
                    Places
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Vote together on trip ideas
                  </p>

                </div>

              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  addPlaceMutation.mutate(placeForm);
                }}
                className="space-y-4 mb-8"
              >

                <input
                  type="text"
                  placeholder="Place title"
                  value={placeForm.title}
                  onChange={(e) => setPlaceForm({
                    ...placeForm,
                    title: e.target.value
                  })}
                  className="w-full border rounded-2xl p-4"
                  required
                />

                <textarea
                  placeholder="Why should we visit this place?"
                  value={placeForm.description}
                  onChange={(e) => setPlaceForm({
                    ...placeForm,
                    description: e.target.value
                  })}
                  className="w-full border rounded-2xl p-4 min-h-[120px]"
                />

                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3 rounded-2xl"
                >
                  Add place
                </button>

              </form>

              <div className="space-y-4">

                {trip.places?.map((place) => (
                  <div
                    key={place.id}
                    className="border rounded-3xl p-5"
                  >

                    <div className="flex items-start justify-between gap-6">

                      <div className="flex-1">

                        <h3 className="text-2xl font-semibold">
                          {place.title}
                        </h3>

                        <p className="text-gray-500 mt-2">
                          {place.description}
                        </p>

                      </div>

                      <div className="flex flex-col items-center gap-2">

                        <button
                          onClick={() => voteMutation.mutate({
                            placeId: place.id,
                            value: 1
                          })}
                          className="w-12 h-12 rounded-2xl bg-green-100 text-2xl"
                        >
                          👍
                        </button>

                        <div className="font-bold text-xl">
                          {place.voteScore || 0}
                        </div>

                        <button
                          onClick={() => voteMutation.mutate({
                            placeId: place.id,
                            value: -1
                          })}
                          className="w-12 h-12 rounded-2xl bg-red-100 text-2xl"
                        >
                          👎
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-3xl shadow-sm p-6">

              <h2 className="text-3xl font-bold mb-6">
                Discussion
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  addCommentMutation.mutate({
                    content: comment
                  });
                }}
                className="mb-6"
              >

                <textarea
                  placeholder="Write a message..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-2xl p-4 min-h-[120px]"
                  required
                />

                <button
                  type="submit"
                  className="mt-4 bg-black text-white px-5 py-3 rounded-2xl"
                >
                  Send
                </button>

              </form>

              <div className="space-y-4">

                {trip.comments?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-2xl p-4"
                  >

                    <div className="text-sm text-gray-400 mb-2">
                      participant
                    </div>

                    <div>
                      {item.content}
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
