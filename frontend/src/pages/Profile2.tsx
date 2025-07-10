import React, { useState } from "react";

const menuItems = [
  "Profile",
  "Events",
  "Registered",
  "Certificated",
  "Logout",
];

const ProfilePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("Profile");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-6">
        {/* Logo + Site Name */}
        <div className="mb-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
            🚀
          </div>
          <h1 className="text-xl font-bold">MyWebsite</h1>
        </div>

        {/* Menu */}
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`text-black text-left px-4 py-2 rounded hover:bg-purple-600 transition-colors
                ${
                  activeMenu === item
                    ? "bg-white font-semibold "
                    : "font-normal"
                }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-8 rounded-bl-2xl">
        <h2 className="text-2xl font-bold mb-4">{activeMenu}</h2>
        <div>
          {/* ตัวอย่างแสดงข้อมูลตามเมนู */}
          {activeMenu === "Profile" && <p>ข้อมูลโปรไฟล์ของคุณ...</p>}
          {activeMenu === "Events" && <p>รายการอีเว้นท์ที่น่าสนใจ...</p>}
          {activeMenu === "Registered" && (
            <p>รายการที่คุณลงทะเบียนแล้ว...</p>
          )}
          {activeMenu === "Certificated" && <p>ใบรับรองของคุณ...</p>}
          {activeMenu === "Logout" && <p>คุณต้องการออกจากระบบ?</p>}
        </div>

        
      </main>
    </div>
  );
};

export default ProfilePage;
