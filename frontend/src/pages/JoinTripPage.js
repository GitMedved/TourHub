import React from 'react';

import {
  useParams,
  useNavigate
} from 'react-router-dom';

import {
  useMutation
} from '@tanstack/react-query';

import {
  FaUsers,
  FaRoute,
  FaArrowRight
} from 'react-icons/fa';

import {
  joinTrip
} from '../features/trips/trips.api';

export default function JoinTripPage() {

  const { token } = useParams();

  const navigate =
    useNavigate();

  const joinMutation =
    useMutation({

      mutationFn: () =>
        joinTrip(token),

      onSuccess: () => {

        navigate('/trips');

      }

    });

  return (
    <div className="
      min-h-screen
      bg-black
      text-white
      flex items-center
      justify-center
      px-6
    ">

      <div className="
        w-full
        max-w-2xl
        rounded-[32px]
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        p-10
      ">

        <div className="
          flex items-center gap-3
          text-blue-400
          mb-6
        ">

          <FaUsers className="
            text-3xl
          " />

          <span className="
            uppercase tracking-widest
            text-sm font-semibold
          ">
            Trip Invitation
          </span>

        </div>

        <h1 className="
          text-5xl
          font-black
          leading-tight
        ">

          Join a collaborative trip workspace

        </h1>

        <p className="
          mt-6
          text-lg
          text-gray-300
        ">

          Plan routes together,
          vote on places,
          discuss ideas,
          and organize shared travel experiences.

        </p>

        <div className="
          mt-10
          rounded-3xl
          bg-white/5
          border border-white/10
          p-6
        ">

          <div className="
            flex items-center gap-3
          ">

            <FaRoute className="
              text-purple-400
              text-2xl
            " />

            <div>

              <div className="
                font-bold
                text-xl
              ">
                Collaborative Planning Workspace
              </div>

              <div className="
                text-sm
                text-gray-400
                mt-1
              ">
                Shared routes • voting • discussions
              </div>

            </div>

          </div>

        </div>

        <button
          onClick={() =>
            joinMutation.mutate()
          }
          disabled={joinMutation.isPending}
          className="
            mt-10
            w-full
            bg-white
            text-black
            py-4
            rounded-2xl
            font-bold
            text-lg
            flex items-center
            justify-center
            gap-3
            hover:scale-[1.01]
            transition
          "
        >

          {
            joinMutation.isPending
              ? 'Joining...'
              : 'Join Workspace'
          }

          <FaArrowRight />

        </button>

        {
          joinMutation.error && (
            <div className="
              mt-6
              text-red-400
              text-sm
            ">
              {joinMutation.error.message}
            </div>
          )
        }

      </div>

    </div>
  );
}
