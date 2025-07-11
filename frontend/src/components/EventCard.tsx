import React from "react";
// import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Event } from "../types/event";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  event: Event;
}

const EventCard: React.FC<Props> = ({ event }) => {
  const { isAuthenticated } = useAuth();

  const handleRegisterClick = () => {
    if (isAuthenticated) {
      // User is authenticated - navigate to apply page
      window.location.href = `/apply/${event.id}`;
    } else {
      // User is not authenticated - redirect to login
      window.location.href = "/login";
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-sm text-gray-600">{event.date} @ {event.location}</p>
      <p className="my-2 text-gray-700">{event.description}</p>
      <div className="flex justify-end space-x-2">
        <a href={`/events/${event.id}`} className="text-blue-600 hover:underline">ดูรายละเอียด</a>
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