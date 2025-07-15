"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  // Use AuthContext instead of localStorage
  const { user, isAuthenticated, logout, loading } = useAuth();

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

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

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
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : isAuthenticated && user ? (
              <>
                <a href="/profile" className="text-gray-700 hover:text-blue-600 flex items-center space-x-2">
                  <span>👤</span>
                  <span className="hidden sm:inline">{user.name}</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 ml-4 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </a>
                <a
                  href="/register"
                  className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#000033] transition-colors duration-300 shadow-lg"
                >
                  Register
                </a>
              </>
            )}
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

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => {
              setSidebarOpen(false);
              setOpenDropdown(null);
            }}
          />
        )}

        {/* Sidebar ที่เลื่อนออกมาจากขวา */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 rounded-l-2xl ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          ref={sidebarRef}
        >
          {/* ส่วนหัวของ Sidebar */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-[#003366] font-bold">More</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* User Info in Sidebar (mobile) */}
          {isAuthenticated && user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* เนื้อหาเมนู */}
          <div className="p-4 space-y-2">
            {dropdownMenus.map((menu, idx) => (
              <div key={idx}>
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-gray-800 py-2 px-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => toggleDropdown(menu.title)}
                >
                  <span>{menu.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition ${
                      openDropdown === menu.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === menu.title && (
                  <div className="pl-4 space-y-1">
                    {menu.items.map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        onClick={() => {
                          setSidebarOpen(false); // ปิด sidebar
                          setOpenDropdown(null); // ปิด dropdown
                        }}
                        className="block w-full text-left text-gray-600 hover:text-blue-600"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Logout in Sidebar for mobile */}
            {isAuthenticated && (
              <div className="pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:text-red-800 py-2 px-2 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* 🔽 แถบสีเต็มความกว้างหน้าเว็บ */}
      <div className="w-full bg-[#003366] py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-20 text-white font-medium flex-col md:flex-row text-center md:text-left
">
          <a href="/" className="hover:underline hover:text-gray-200 transition-colors">Home</a>
          <a href="/events" className="hover:underline hover:text-gray-200 transition-colors">Event</a>
          <a href="/about" className="hover:underline hover:text-gray-200 transition-colors">About</a>
          <a href="/testprofile" className="hover:underline hover:text-gray-200 transition-colors">Profile</a>
        </div>
      </div>
    </>
  );
};

export default Navbar;