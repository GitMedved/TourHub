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

export default function TripDetailsPage() {

  const { id } = useParams();

  const queryClient = useQueryClient();

  const [placeForm, setPlaceForm] = useState({
    title: '',
    description: ''
  });

  const [comment, setComment] = useState('');

  const {
    data: trips = []
  } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });

  const trip = trips.find(
    (item) => item.id === id
  );

  const addPlaceMutation = useMutation({
    mutationFn: (data) =>
      addPlace(id, data),

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
    mutationFn: (data) =>
      addComment(id, data),

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

  if (!trip) {
    return (
      <div className="p-10">
        Trip not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl p-8 shadow mb-8">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-4xl font-bold">
                {trip.title}
              </h1>

              <p className="text-gray-500 mt-2">
                {trip.destination}
              </p>
            </div>

            <div className="bg-black text-white px-4 py-2 rounded-xl">
              {trip.visibility}
            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div>

            <div className="bg-white rounded-3xl p-6 shadow mb-6">

              <h2 className="text-2xl font-bold mb-4">
                Add place
              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Place title"
                  value={placeForm.title}
                  onChange={(e) =>
                    setPlaceForm({
                      ...placeForm,
                      title: e.target.value
                    })
                  }
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  placeholder="Description"
                  value={placeForm.description}
                  onChange={(e) =>
                    setPlaceForm({
                      ...placeForm,
                      description: e.target.value
                    })
                  }
                  className="w-full border rounded-xl p-3 h-32"
                />

                <button
                  onClick={() =>
                    addPlaceMutation.mutate(placeForm)
                  }
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  Add place
                </button>

              </div>

            </div>

            <div className="space-y-4">

              {trip.places?.map((place) => (

                <div
                  key={place.id}
                  className="bg-white rounded-3xl p-6 shadow"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <h3 className="text-xl font-bold">
                        {place.title}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        {place.description}
                      </p>
                    </div>

                    <div className="text-right">

                      <div className="text-2xl font-bold">
                        {place.voteScore || 0}
                      </div>

                      <div className="text-xs text-gray-400">
                        votes
                      </div>

                    </div>

                  </div>

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={() =>
                        voteMutation.mutate({
                          placeId: place.id,
                          value: 1
                        })
                      }
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-xl"
                    >
                      👍 Vote
                    </button>

                    <button
                      onClick={() =>
                        voteMutation.mutate({
                          placeId: place.id,
                          value: -1
                        })
                      }
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-xl"
                    >
                      👎 Skip
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

          <div>

            <div className="bg-white rounded-3xl p-6 shadow">

              <h2 className="text-2xl font-bold mb-4">
                Discussion
              </h2>

              <div className="space-y-3 mb-6">

                {trip.comments?.map((item) => (

                  <div
                    key={item.id}
                    className="bg-gray-100 rounded-2xl p-4"
                  >
                    {item.content}
                  </div>

                ))}

              </div>

              <div className="space-y-4">

                <textarea
                  placeholder="Write message..."
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  className="w-full border rounded-xl p-3 h-32"
                />

                <button
                  onClick={() =>
                    addCommentMutation.mutate({
                      content: comment
                    })
                  }
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  Send
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
