import React, { useState } from 'react';

import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  addPlace,
  addComment,
  voteForPlace
} from './trips.api';

export default function TripCard({ trip }) {

  const queryClient = useQueryClient();

  const [placeForm, setPlaceForm] = useState({
    title: ''
  });

  const [comment, setComment] = useState('');

  const addPlaceMutation = useMutation({
    mutationFn: (data) =>
      addPlace(trip.id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      setPlaceForm({
        title: ''
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) =>
      addComment(trip.id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      setComment('');
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({ placeId, value }) =>
      voteForPlace(placeId, value),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });
    }
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow">

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            {trip.title}
          </h2>

          <p className="text-gray-500">
            {trip.destination}
          </p>
        </div>

        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
          {trip.visibility}
        </span>

      </div>

      <div className="mt-6">

        <h3 className="font-semibold mb-3">
          Places
        </h3>

        <div className="space-y-3">

          {trip.places?.map((place) => (
            <div
              key={place.id}
              className="border rounded-xl p-4"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="font-medium">
                    {place.title}
                  </div>

                  <div className="text-sm text-gray-500">
                    Score: {place.voteScore}
                  </div>
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => voteMutation.mutate({
                      placeId: place.id,
                      value: 1
                    })}
                    className="bg-green-100 px-3 py-1 rounded-lg"
                  >
                    👍
                  </button>

                  <button
                    onClick={() => voteMutation.mutate({
                      placeId: place.id,
                      value: -1
                    })}
                    className="bg-red-100 px-3 py-1 rounded-lg"
                  >
                    👎
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            addPlaceMutation.mutate(placeForm);
          }}
          className="mt-4 flex gap-2"
        >

          <input
            type="text"
            placeholder="Suggest place..."
            value={placeForm.title}
            onChange={(e) => setPlaceForm({
              title: e.target.value
            })}
            className="flex-1 border rounded-xl p-3"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-4 rounded-xl"
          >
            Add
          </button>

        </form>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold mb-3">
          Discussion
        </h3>

        <div className="space-y-2">

          {trip.comments?.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-xl p-3"
            >
              {comment.content}
            </div>
          ))}

        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            addCommentMutation.mutate({
              content: comment
            });
          }}
          className="mt-4 flex gap-2"
        >

          <input
            type="text"
            placeholder="Write comment..."
            value={comment}
            onChange={(e) => setComment(
              e.target.value
            )}
            className="flex-1 border rounded-xl p-3"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-4 rounded-xl"
          >
            Send
          </button>

        </form>

      </div>

    </div>
  );
}
