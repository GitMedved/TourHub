import React, { useState } from 'react';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  getTrips,
  createTrip
} from './trips.api';

import TripCard from './TripCard';

export default function TripsPage() {

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    destination: ''
  });

  const {
    data: trips = [],
    isLoading
  } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });

  const createTripMutation = useMutation({
    mutationFn: createTrip,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips']
      });

      setForm({
        title: '',
        destination: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    createTripMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        Loading trips...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Trip Workspaces
            </h1>

            <p className="text-gray-500 mt-2">
              Plan trips collaboratively with friends
            </p>
          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow mb-8"
        >

          <h2 className="text-2xl font-semibold mb-4">
            Create New Trip
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Trip title"
              value={form.title}
              onChange={(e) => setForm({
                ...form,
                title: e.target.value
              })}
              className="border rounded-xl p-3"
              required
            />

            <input
              type="text"
              placeholder="Destination"
              value={form.destination}
              onChange={(e) => setForm({
                ...form,
                destination: e.target.value
              })}
              className="border rounded-xl p-3"
              required
            />

          </div>

          <button
            type="submit"
            className="mt-4 bg-black text-white px-6 py-3 rounded-xl"
          >
            Create Workspace
          </button>

        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
            />
          ))}

        </div>

      </div>

    </div>
  );
}
