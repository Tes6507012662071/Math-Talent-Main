import React from "react";
import { Event } from "../types/event";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Props {
  event: Event;
}

// ✅ ดึง Base URL (ต้องมั่นใจว่า .env.local ถูกต้อง)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EventCard: React.FC<Props> = ({ event }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    if (isAuthenticated) {
      // ‼️ แก้ไข: ใช้ event.id ‼️
      navigate(`/apply/${event.id}`);
    } else {
      navigate("/login");
    }
  };

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
    } catch (e) { return "Invalid Date"; }
  };

  // ✅ สร้าง URL เต็มสำหรับรูปภาพ
  const imageUrl = event.images
    ? `${API_BASE_URL}${event.images}` // (เช่น http://localhost:5000/api-images/events/...)
    : undefined;

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      {/* รูปภาพด้านบน */}
      {imageUrl ? (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={imageUrl} // ✅ ใช้ imageUrl
            alt={event.nameEvent}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement?.classList.add('hidden');
            }}
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">ไม่มีรูปภาพ</span>
        </div>
      )}

      {/* ข้อมูลด้านล่าง */}
      <div className="p-4">
        {/* ✅ ใช้ event.nameEvent */}
        <h3 className="text-lg font-semibold mb-2">{event.nameEvent}</h3>
        
        <p className="text-sm text-gray-600 mb-3">
          {formatDate(event.dateAndTime)} @ {event.location || 'N/A'}
        </p>

        <div className="flex justify-between items-center mt-4">
          {/* ‼️ แก้ไข: ใช้ event.id ‼️ */}
          <a href={`/events/${event.id}`} className="text-blue-600 hover:underline text-sm">
            ดูรายละเอียด
          </a>
          <button 
            onClick={handleRegisterClick}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            สมัครสอบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;