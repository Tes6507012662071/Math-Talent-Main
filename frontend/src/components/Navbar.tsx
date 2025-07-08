import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/images/logo.png" 
          alt="logo"
          className="rounded-lg shadow-lg w-10 h-10"
        />
        <h1 className="text-xl font-bold">MATH TALENT FOUNDATION</h1>
      </div>
      <div className="space-x-4">
        <a href="#about" className="hover:underline">เกี่ยวกับเรา</a>
        <a href="#events" className="hover:underline">กิจกรรม</a>
        <a href="/login" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100">Sign In</a>
        <a href="/register" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100">Register</a>
      </div>
    </nav>
  );
};

export default Navbar;
