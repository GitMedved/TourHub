import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMapMarkedAlt, FaUser, FaComments, FaHome } from 'react-icons/fa';

const Sidebar = ({ user: propUser }) => {
  const [user, setUser] = useState(() => {
    if (propUser) return propUser;
    try {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

  if (!user || user.role !== 'USER') return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] ml-3">
      <nav className="flex flex-col gap-2.5 bg-white/95 backdrop-blur-xl rounded-full px-2 py-3 shadow-xl border border-gray-100/50">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `
            w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group relative
            ${isActive ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}
          `}
        >
          <FaHome className="text-lg" />
          <span className="absolute left-14 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap font-medium pointer-events-none shadow-lg">
            Лента событий
          </span>
        </NavLink>
        
        <NavLink 
          to="/map" 
          className={({ isActive }) => `
            w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group relative
            ${isActive ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}
          `}
        >
          <FaMapMarkedAlt className="text-lg" />
          <span className="absolute left-14 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap font-medium pointer-events-none shadow-lg">
            Карта событий
          </span>
        </NavLink>
        
        <div className="w-8 h-px bg-gray-200 mx-auto my-1"></div>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `
            w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group relative
            ${isActive ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}
          `}
        >
          <FaUser className="text-lg" />
          <span className="absolute left-14 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap font-medium pointer-events-none shadow-lg">
            Профиль
          </span>
        </NavLink>
        
        <NavLink 
          to="/chat" 
          className={({ isActive }) => `
            w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group relative
            ${isActive ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-200' : 'text-gray-400 hover:text-cyan-500 hover:bg-cyan-50'}
          `}
        >
          <FaComments className="text-lg" />
          <span className="absolute left-14 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap font-medium pointer-events-none shadow-lg">
            Чат поддержки
          </span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
