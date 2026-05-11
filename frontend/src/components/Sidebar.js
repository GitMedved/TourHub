import React, {
  useState,
  useEffect
} from 'react';

import {
  NavLink
} from 'react-router-dom';

import {
  FaHome,
  FaMapMarkedAlt,
  FaUser,
  FaRoute,
  FaUsers,
  FaGlobe
} from 'react-icons/fa';

const Sidebar = ({
  user: propUser
}) => {

  const [user, setUser] = useState(() => {

    if (propUser) {
      return propUser;
    }

    try {

      const data =
        localStorage.getItem('user');

      return data
        ? JSON.parse(data)
        : null;

    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    }
  }, [propUser]);

  if (!user) {
    return null;
  }

  const navItemClass = ({
    isActive
  }, activeClasses, hoverClasses) => `
    w-12 h-12
    rounded-2xl
    flex items-center justify-center
    transition-all duration-200
    group relative

    ${
      isActive
        ? activeClasses
        : hoverClasses
    }
  `;

  const tooltipClass = `
    absolute left-16
    bg-gray-900 text-white
    text-xs px-3 py-2
    rounded-xl
    opacity-0 group-hover:opacity-100
    transition-all duration-300
    translate-x-2 group-hover:translate-x-0
    whitespace-nowrap
    font-medium
    pointer-events-none
    shadow-xl
  `;

  return (
    <div className="
      fixed left-0 top-1/2
      -translate-y-1/2
      z-[9999]
      ml-4
    ">

      <nav className="
        flex flex-col gap-3
        bg-white/95
        backdrop-blur-xl
        rounded-3xl
        px-3 py-4
        shadow-2xl
        border border-gray-100
      ">

        <NavLink
          to="/"
          end
          className={(props) =>
            navItemClass(
              props,
              'bg-black text-white shadow-lg',
              'text-gray-400 hover:text-black hover:bg-gray-100'
            )
          }
        >

          <FaHome className="text-lg" />

          <span className={tooltipClass}>
            Home Feed
          </span>

        </NavLink>

        <NavLink
          to="/trips"
          className={(props) =>
            navItemClass(
              props,
              'bg-blue-600 text-white shadow-lg shadow-blue-200',
              'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            )
          }
        >

          <FaRoute className="text-lg" />

          <span className={tooltipClass}>
            My Trips
          </span>

        </NavLink>

        <NavLink
          to="/map"
          className={(props) =>
            navItemClass(
              props,
              'bg-green-600 text-white shadow-lg shadow-green-200',
              'text-gray-400 hover:text-green-600 hover:bg-green-50'
            )
          }
        >

          <FaMapMarkedAlt className="text-lg" />

          <span className={tooltipClass}>
            Shared Maps
          </span>

        </NavLink>

        <div className="
          w-8 h-px
          bg-gray-200
          mx-auto my-1
        " />

        <NavLink
          to="/events"
          className={(props) =>
            navItemClass(
              props,
              'bg-purple-600 text-white shadow-lg shadow-purple-200',
              'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            )
          }
        >

          <FaGlobe className="text-lg" />

          <span className={tooltipClass}>
            Community Routes
          </span>

        </NavLink>

        <NavLink
          to="/chat"
          className={(props) =>
            navItemClass(
              props,
              'bg-cyan-600 text-white shadow-lg shadow-cyan-200',
              'text-gray-400 hover:text-cyan-600 hover:bg-cyan-50'
            )
          }
        >

          <FaUsers className="text-lg" />

          <span className={tooltipClass}>
            Collaboration Hub
          </span>

        </NavLink>

        <div className="
          w-8 h-px
          bg-gray-200
          mx-auto my-1
        " />

        <NavLink
          to="/profile"
          className={(props) =>
            navItemClass(
              props,
              'bg-orange-500 text-white shadow-lg shadow-orange-200',
              'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
            )
          }
        >

          <FaUser className="text-lg" />

          <span className={tooltipClass}>
            Profile
          </span>

        </NavLink>

      </nav>

    </div>
  );
};

export default Sidebar;
