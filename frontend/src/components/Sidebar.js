import React from 'react';

import {
  NavLink
} from 'react-router-dom';

import {
  FaHome,
  FaMapMarkedAlt,
  FaUser,
  FaUsers,
  FaCompass
} from 'react-icons/fa';

const navItems = [
  {
    to: '/',
    icon: FaCompass,
    label: 'Discover'
  },

  {
    to: '/trips',
    icon: FaUsers,
    label: 'Trips'
  },

  {
    to: '/map',
    icon: FaMapMarkedAlt,
    label: 'Map'
  },

  {
    to: '/profile',
    icon: FaUser,
    label: 'Profile'
  }
];

function Sidebar() {

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem('user')
      );
    } catch {
      return null;
    }
  })();

  if (!user) {
    return null;
  }

  return (
    <div className="
      fixed
      left-0
      top-1/2
      -translate-y-1/2
      z-50
      ml-4
    ">

      <nav className="
        flex
        flex-col
        gap-3
        bg-white/95
        backdrop-blur-xl
        rounded-3xl
        p-3
        shadow-2xl
        border
      ">

        {navItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}

              className={({ isActive }) => `
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                transition-all
                duration-200
                relative
                group

                ${
                  isActive
                    ? 'bg-black text-white scale-105'
                    : 'text-gray-500 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="text-xl" />

              <span className="
                absolute
                left-16
                bg-black
                text-white
                text-sm
                px-3
                py-2
                rounded-xl
                opacity-0
                group-hover:opacity-100
                transition-all
                whitespace-nowrap
                pointer-events-none
              ">
                {item.label}
              </span>

            </NavLink>
          );
        })}

      </nav>
    </div>
  );
}

export default Sidebar;
