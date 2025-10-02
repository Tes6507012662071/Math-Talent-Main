"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

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

  const handleProfileClick = () => {
    if (!user) return;
    if (user.role === "admin") {
      console.log("[Navbar] Redirect → Admin Dashboard");
      navigate("/admin/dashboard");
    } else {
      console.log("[Navbar] Redirect → User Profile");
      navigate("/profile");
    }
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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
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
            {/* Navigation Buttons */}
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : isAuthenticated && user ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="text-gray-700 hover:text-blue-600 flex items-center space-x-2"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
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
                  เข้าสู่ระบบ
                </a>
                <a
                  href="/register"
                  className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#000033] transition-colors duration-300 shadow-lg"
                >
                  ลงชื่อเข้าใช้
                </a>
              </>
            )}
          </div>
        </div>
        
        {/* Dropdown Menus + Sidebar (เหมือนเดิม) */}
        {/* ... */}
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* 🔽 แถบสีเต็มความกว้างหน้าเว็บ */}
      <div className="w-full bg-[#003366] py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-20 text-white font-medium flex-col md:flex-row text-center md:text-left">
          <a href="/" className="hover:underline hover:text-gray-200 transition-colors">หน้าหลัก</a>
          <a href="/events" className="hover:underline hover:text-gray-200 transition-colors">กิจกรรม</a>
          <a href="/about" className="hover:underline hover:text-gray-200 transition-colors">เกี่ยวกับ</a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
