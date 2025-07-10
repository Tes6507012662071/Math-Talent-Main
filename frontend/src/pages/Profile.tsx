import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../api/auth";
import { getMyRegisteredEvents, uploadPaymentSlip } from "../api/registration";

interface EventStatus {
  event: {
    title: string;
    date: string;
  };
  status: string; 
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [events, setEvents] = useState<EventStatus[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchUserProfile(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      });

    getMyRegisteredEvents(token)
      .then(setEvents)
      .catch(() => {
        console.log("โหลด event ไม่ได้");
      });
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
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  fileInput.click();
};

  if (!user) return <div className="p-8 text-center">กำลังโหลด...</div>;

  return (
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
              <p className="text-sm text-gray-500">วันสอบ: {new Date(reg.event.date).toLocaleDateString()}</p>
              <p className="mt-2">
                <span className="font-medium">สถานะ:</span> {reg.status}
              </p>
                  {/* ⬇⬇⬇ เพิ่มจากตรงนี้เข้าไป */}
                {reg.status === "pending" && (
                  <button
                    onClick={() => handleUploadSlip((reg as any)._id)}
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    อัปโหลดสลิป
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
