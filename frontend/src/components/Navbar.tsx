"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  // ✅ ปิด dropdown เมื่อคลิกนอกกล่อง
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownMenus = [
    {
      title: 'Events',
      items: [
        { name: 'การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568', href: '/events' },
        { name: 'Lorem', href: '/events/event2' },
        { name: 'Lorem', href: '/events/event3' },
      ],
    },
    {
      title: 'CommitteeMember',
      items: [
        { name: 'Team', href: '/team' },
        { name: 'Lorem', href: '/events/event5' },
        { name: 'Lorem', href: '/events/event6' },
      ],
    },
  ];

  return (
    <>
      <nav className="bg-white text-[#1B3C53] shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 flex items-center h-16">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo.jpg"
              alt="Logo"
              className="rounded-3xl shadow-lg w-12 h-12"
            />
            <h1 className="text-xl font-bold">MATH TALENT FOUNDATION</h1>
          </div>

          {/* Search + Buttons */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-60 px-10 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Navigation Buttons */}
            <a
              href="/login"
              className="text-gray-700 hover:text-blue-600"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#000033] transition-colors duration-300 shadow-lg"
            >
              Register
            </a>
          </div>
        </div>
        
        {/* Dropdown Menus */}
        <div className="fixed top-4 right-4 z-50 md:right-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* 🔽 แถบสีเต็มความกว้างหน้าเว็บ */}
      <div className="w-full bg-[#003366] py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center mt-4">
          {/* future content */}
        </div>
      </div>
    </>
  );
};

export default Navbar;
