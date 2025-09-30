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

  // แปลง dateAndTime เป็นรูปแบบที่อ่านง่าย
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
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {/* ✅ ใช้ nameEvent แทน title */}
      <h3 className="text-lg font-semibold">{event.nameEvent}</h3>
      
      {/* ✅ ใช้ dateAndTime และแปลงเป็นวันที่อ่านง่าย */}
      <p className="text-sm text-gray-600">
        {formatDate(event.dateAndTime)} @ {event.location}
      </p>
      
      {/* ✅ ใช้ detail แทน description */}
      <p className="my-2 text-gray-700">{event.detail}</p>
      
      <div className="flex justify-end space-x-2 mt-6">
        <a href={`/events/${event._id}`} className="text-blue-600 hover:underline">More</a>
        <button 
          onClick={handleRegisterClick}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          สมัครสอบ
        </button>
      </div>
    </div>
  );
};

export default EventCard;