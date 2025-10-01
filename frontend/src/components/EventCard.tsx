import React from "react";
import { Event } from "../types/event";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  event: Event;
}

const EventCard: React.FC<Props> = ({ event }) => {
  const { isAuthenticated } = useAuth();

  const handleRegisterClick = () => {
    if (isAuthenticated) {
      window.location.href = `/apply/${event._id}`;
    } else {
      window.location.href = "/login";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      {/* รูปภาพด้านบน */}
      {event.images ? (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={event.images}
            alt={event.nameEvent}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">ไม่มีรูปภาพ</span>
        </div>
      )}

      {/* ข้อมูลด้านล่าง */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{event.nameEvent}</h3>
        
        <p className="text-sm text-gray-600 mb-3">
          {formatDate(event.dateAndTime)} @ {event.location}
        </p>

        <div className="flex justify-between items-center mt-4">
          <a href={`/events/${event._id}`} className="text-blue-600 hover:underline text-sm">
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