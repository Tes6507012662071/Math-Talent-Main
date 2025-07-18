import React, { useEffect, useState } from "react";
import { User, Upload, Download, LogOut, Edit, Save, X, FileText, Award, Settings, Home, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { fetchUserProfile } from "../api/auth";
import { getMyRegisteredEvents, uploadPaymentSlip } from "../api/registration";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface EventStatus {
  _id: string;
  event: {
    title: string;
    date: string;
  };
  status: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [events, setEvents] = useState<EventStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("ไม่พบ token ใน localStorage");
      setLoading(false);
      return;
    }

    console.log("📌 ใช้ token:", token);

    Promise.all([
      fetchUserProfile(token),
      getMyRegisteredEvents(token),
    ])
      .then(([userData, registeredEvents]) => {
        setUser(userData);
        setEvents(registeredEvents);
      })
      .catch((err) => {
        console.error("❌ เกิด error ขณะโหลดข้อมูล:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSlip = async (registrationId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await uploadPaymentSlip(token, registrationId, file);
        alert("อัปโหลดสลิปสำเร็จ");

        const updatedEvents = await getMyRegisteredEvents(token);
        setEvents(updatedEvents);
      } catch (error) {
        console.error("❌ อัปโหลดสลิปล้มเหลว:", error);
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
      }
    };

    fileInput.click();
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');


  if (loading) return <div className="p-8 text-center">⏳ กำลังโหลดข้อมูล...</div>;
  if (!user) return <div className="p-8 text-center">⚠ ไม่พบข้อมูลผู้ใช้</div>;

  //const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'activity' | 'certificate'>('dashboard');
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
  };

  
  
  return (
    <>
    <Navbar />
    <div className="min-h-screen flex bg-gray-100 p-4">
      {/* Sidebar with rounded corners */}
      <aside className="w-64 h-screen bg-white shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
          <div>
          <div className="flex items-center gap-3 px-6 py-4 border-b">
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-800">Profile Dashboard</h1>
          </div>
          <nav className="mt-4">
              <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              >
              <Home size={16} />
              Dashboard
              </button>
              <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              >
              <Settings size={16} />
              Manage Profile
              </button>
              <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'activity'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              >
              <FileText size={16} />
              Activity List
              </button>
              <button
              onClick={() => setActiveTab('certificate')}
              className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'certificate'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              >
              <Award size={16} />
              Certificates
              </button>
          </nav>
          </div>
          <div className="px-6 py-4 border-t">
          <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
          >
              <LogOut size={16} />
              Log Out
          </button>
          </div>
      </aside>
    </div>

    

    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">สวัสดีคุณ {user.name}</h1>
      <p className="text-gray-600 mb-6">Email: {user.email}</p>

      <h2 className="text-lg font-semibold mb-2">กิจกรรมที่สมัครไว้</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีการสมัครสอบ</p>
      ) : (
        <ul className="space-y-4">
          {events.map((reg, idx) => (
            <li key={idx} className="border p-4 rounded shadow-sm">
              <h3 className="font-semibold">{reg.event.title}</h3>
              <p className="text-sm text-gray-500">
                วันสอบ: {new Date(reg.event.date).toLocaleDateString()}
              </p>
              <p className="mt-2">
                <span className="font-medium">สถานะ:</span> {reg.status}
              </p>
              {reg.status === "pending" && (
                <button
                  onClick={() => handleUploadSlip(reg._id)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  อัปโหลดสลิป
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    
    <Footer />
    </>
  );
};

export default Profile;
