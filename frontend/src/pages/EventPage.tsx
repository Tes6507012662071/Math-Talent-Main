import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { fetchEvents } from '../api/events';
import { Event } from '../types/event';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EventPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดกิจกรรมได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.registrationType === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* This div will grow to fill available space */}
      <div className="flex-grow">
        <div className="bg-white shadow-md rounded-xl p-8 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">กิจกรรมทั้งหมด</h1>
            <p className="text-gray-600">ค้นหาและสมัครเข้าร่วมการแข่งขันคณิตศาสตร์และกิจกรรมต่างๆ</p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter('competition')}
              className={`px-6 py-2 rounded-full transition ${
                filter === 'competition'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              การแข่งขัน
            </button>
            <button
              onClick={() => setFilter('workshop')}
              className={`px-6 py-2 rounded-full transition ${
                filter === 'workshop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              เวิร์กช็อป
            </button>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">ไม่พบกิจกรรม</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EventPage;