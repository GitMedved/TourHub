import React, { useState } from 'react';

import {
  Link
} from 'react-router-dom';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  getTrips,
  createTrip
} from './trips.api';

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
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-8">

        <div className="flex items-center justify-between mb-10">

          <div>

            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">

              <div className="w-2 h-2 rounded-full bg-green-500"></div>

              <span className="text-sm font-medium">
                collaborative planning workspace
              </span>

            </div>

            <h1 className="text-5xl font-bold">
              Trips
            </h1>

            <p className="text-gray-500 mt-3 text-lg">
              Build travel plans together with friends
            </p>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-10">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl font-bold">
                Create workspace
              </h2>

              <p className="text-gray-500 mt-1">
                Start planning collaboratively
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >

            <input
              type="text"
              placeholder="Trip title"
              value={form.title}
              onChange={(e) => setForm({
                ...form,
                title: e.target.value
              })}
              className="border rounded-2xl p-4"
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
              className="border rounded-2xl p-4"
              required
            />

            <button
              type="submit"
              className="bg-black text-white rounded-2xl font-semibold"
            >
              Create trip
            </button>

          </form>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {trips.map((trip) => (

            <Link
              href={`/trips/${trip.id}`}
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="group"
            >

              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                <div className="flex items-start justify-between mb-6">

                  <div>

                    <div className="flex items-center gap-2 mb-3">

                      <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-medium">
                        workspace
                      </span>

                      <span className="px-3 py-1 rounded-full bg-gray-100 text-xs">
                        {trip.visibility}
                      </span>

                    </div>

                    <h2 className="text-3xl font-bold group-hover:opacity-70 transition">
                      {trip.title}
                    </h2>

                    <p className="text-gray-500 mt-2 text-lg">
                      {trip.destination}
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <div className="text-sm text-gray-400 mb-1">
                      places
                    </div>

                    <div className="text-3xl font-bold">
                      {trip.places?.length || 0}
                    </div>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <div className="text-sm text-gray-400 mb-1">
                      discussion
                    </div>

                    <div className="text-3xl font-bold">
                      {trip.comments?.length || 0}
                    </div>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <div className="text-sm text-gray-400 mb-1">
                      members
                    </div>

                    <div className="text-3xl font-bold">
                      {trip.members?.length || 1}
                    </div>

                  </div>

                </div>

                <div className="space-y-3">

                  {trip.places?.slice(0, 3).map((place) => (

                    <div
                      key={place.id}
                      className="border rounded-2xl p-4 flex items-center justify-between"
                    >

                      <div>

                        <div className="font-semibold">
                          {place.title}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
                          collaborative voting
                        </div>

                      </div>

                      <div className="text-xl font-bold">
                        {place.voteScore || 0}
                      </div>

                    </div>

                  ))}

                </div>

                <div className="mt-6 pt-6 border-t">

                  <div className="flex items-center justify-between">

                    <div className="text-sm text-gray-400">
                      open workspace
                    </div>

                    <div className="text-sm font-semibold">
                      enter →
                    </div>

                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </div>
  );
}
