import React from 'react';

import {
  Link
} from 'react-router-dom';

import {
  FaRoute,
  FaUsers,
  FaMapMarkedAlt,
  FaGlobeEurope,
  FaArrowRight
} from 'react-icons/fa';

import Header from '../components/Header';

const activeTrips = [
  {
    id: 1,
    title: 'Japan Spring Journey',
    destination: 'Tokyo • Kyoto • Osaka',
    members: 4,
    activity: '2 new places added'
  },
  {
    id: 2,
    title: 'Iceland Roadtrip',
    destination: 'Reykjavik • Vik • Hofn',
    members: 3,
    activity: 'Route voting in progress'
  }
];

const communityFeed = [
  'Anna added Kyoto Food Walk',
  'Mike voted for Lisbon route',
  'Sophie created a new Italy trip',
  'Daniel invited 2 collaborators'
];

const discoverRoutes = [
  {
    title: 'Hidden Gems of Portugal',
    author: 'Community',
    saves: 124
  },
  {
    title: 'Nordic Remote Work Journey',
    author: 'Travel Collective',
    saves: 87
  },
  {
    title: 'Bali Wellness Route',
    author: 'Explorer Group',
    saves: 203
  }
];

const TripCard = ({
  trip
}) => (
  <div className="
    bg-white
    rounded-3xl
    p-6
    shadow-sm
    hover:shadow-xl
    transition-all duration-300
    border border-gray-100
  ">

    <div className="
      flex items-start justify-between
    ">

      <div>

        <h3 className="
          text-2xl font-bold
          text-gray-900
        ">
          {trip.title}
        </h3>

        <p className="
          text-gray-500 mt-1
        ">
          {trip.destination}
        </p>

      </div>

      <div className="
        bg-blue-50
        text-blue-600
        px-3 py-2
        rounded-2xl
        text-sm font-semibold
      ">
        {trip.members} members
      </div>

    </div>

    <div className="
      mt-6
      bg-gray-50
      rounded-2xl
      p-4
      text-sm text-gray-600
    ">
      {trip.activity}
    </div>

    <button className="
      mt-6
      w-full
      bg-black
      text-white
      py-3
      rounded-2xl
      hover:opacity-90
      transition
      flex items-center justify-center gap-2
    ">
      Open Workspace
      <FaArrowRight />
    </button>

  </div>
);

const HomePage = () => {

  return (
    <div className="
      min-h-screen
      bg-gray-50
    ">

      <Header />

      <section className="
        relative overflow-hidden
        bg-black
        text-white
      ">

        <div className="
          absolute inset-0
          opacity-20
          bg-[radial-gradient(circle_at_top_left,#3b82f6,transparent_35%),radial-gradient(circle_at_bottom_right,#8b5cf6,transparent_35%)]
        " />

        <div className="
          relative
          max-w-7xl
          mx-auto
          px-6
          py-24
        ">

          <div className="
            max-w-4xl
          ">

            <div className="
              inline-flex items-center gap-2
              bg-white/10
              backdrop-blur
              border border-white/10
              rounded-full
              px-4 py-2
              text-sm
              mb-8
            ">

              <FaUsers />

              Collaborative Travel Platform

            </div>

            <h1 className="
              text-5xl md:text-7xl
              font-black
              leading-tight
            ">

              Plan trips
              together.

            </h1>

            <p className="
              text-xl
              text-gray-300
              mt-8
              max-w-2xl
            ">

              Create collaborative travel workspaces,
              invite friends,
              vote on places,
              build shared memories.

            </p>

            <div className="
              flex flex-wrap gap-4
              mt-10
            ">

              <Link
                to="/trips"
                className="
                  bg-white
                  text-black
                  px-8 py-4
                  rounded-2xl
                  font-semibold
                  hover:scale-[1.02]
                  transition
                "
              >
                Create Trip
              </Link>

              <Link
                to="/events"
                className="
                  border border-white/20
                  bg-white/5
                  backdrop-blur
                  px-8 py-4
                  rounded-2xl
                  font-semibold
                  hover:bg-white/10
                  transition
                "
              >
                Explore Community
              </Link>

            </div>

          </div>

        </div>

      </section>

      <main className="
        max-w-7xl
        mx-auto
        px-6
        py-16
      ">

        <section>

          <div className="
            flex items-center justify-between
            mb-8
          ">

            <div>

              <h2 className="
                text-4xl
                font-bold
              ">
                Active Trips
              </h2>

              <p className="
                text-gray-500
                mt-2
              ">
                Shared planning workspaces
              </p>

            </div>

            <Link
              to="/trips"
              className="
                text-blue-600
                font-semibold
              "
            >
              View all
            </Link>

          </div>

          <div className="
            grid grid-cols-1
            lg:grid-cols-2
            gap-6
          ">

            {activeTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
              />
            ))}

          </div>

        </section>

        <section className="
          mt-20
          grid grid-cols-1
          lg:grid-cols-2
          gap-8
        ">

          <div className="
            bg-white
            rounded-3xl
            p-8
            shadow-sm
            border border-gray-100
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <FaUsers className="
                text-blue-600
                text-2xl
              " />

              <h2 className="
                text-3xl
                font-bold
              ">
                Community Activity
              </h2>

            </div>

            <div className="
              space-y-4
            ">

              {communityFeed.map((item, index) => (

                <div
                  key={index}
                  className="
                    flex items-center gap-3
                    bg-gray-50
                    rounded-2xl
                    p-4
                  "
                >

                  <div className="
                    w-2 h-2
                    rounded-full
                    bg-green-500
                  " />

                  <span className="
                    text-gray-700
                  ">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

          <div className="
            bg-white
            rounded-3xl
            p-8
            shadow-sm
            border border-gray-100
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <FaGlobeEurope className="
                text-purple-600
                text-2xl
              " />

              <h2 className="
                text-3xl
                font-bold
              ">
                Discover Routes
              </h2>

            </div>

            <div className="
              space-y-4
            ">

              {discoverRoutes.map((route, index) => (

                <div
                  key={index}
                  className="
                    border border-gray-100
                    rounded-2xl
                    p-5
                    hover:bg-gray-50
                    transition
                  "
                >

                  <div className="
                    flex items-center justify-between
                  ">

                    <div>

                      <h3 className="
                        font-bold
                        text-lg
                      ">
                        {route.title}
                      </h3>

                      <p className="
                        text-sm
                        text-gray-500
                        mt-1
                      ">
                        by {route.author}
                      </p>

                    </div>

                    <div className="
                      text-sm
                      text-gray-400
                    ">
                      {route.saves} saves
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="
          mt-20
          bg-gradient-to-r
          from-blue-600
          to-purple-600
          rounded-[32px]
          text-white
          p-10
        ">

          <div className="
            flex flex-col lg:flex-row
            items-start lg:items-center
            justify-between
            gap-8
          ">

            <div>

              <h2 className="
                text-4xl
                font-black
              ">
                Start planning together
              </h2>

              <p className="
                mt-4
                text-white/80
                max-w-2xl
              ">

                Build collaborative travel spaces,
                organize routes,
                share ideas,
                and travel smarter as a group.

              </p>

            </div>

            <Link
              to="/trips"
              className="
                bg-white
                text-black
                px-8 py-4
                rounded-2xl
                font-bold
                whitespace-nowrap
              "
            >
              Create Workspace
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
};

export default HomePage;
