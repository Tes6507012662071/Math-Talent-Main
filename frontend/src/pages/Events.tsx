import React, { useEffect, useState } from "react";
import { Event } from "../types/event";
import { fetchEvents } from "../api/events";
import EventCard from "../components/EventCard";

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black">กิจกรรมที่เปิดให้ลงสมัคร</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Events;
