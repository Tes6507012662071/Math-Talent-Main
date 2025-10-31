import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt as FaCalendarAltRaw } from "react-icons/fa";
import { FaMapMarkerAlt as FaMapMarkerAltRaw } from "react-icons/fa";
import { FaUserFriends as FaUsersRaw } from "react-icons/fa"; 
import { FaHashtag as FaHashtagRaw } from "react-icons/fa"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { fetchEvents } from "../api/events";
import { Event as EventType, Station } from "../types/event";

const FaCalendarAlt = FaCalendarAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaMapMarkerAlt = FaMapMarkerAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaUsers = FaUsersRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaHashtag = FaHashtagRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
        if (!res.ok) {
           const errorData = await res.json().catch(() => ({ message: res.statusText }));
           throw new Error(`เกิดข้อผิดพลาด (${res.status}): ${errorData.message || res.statusText}`);
        }
        const data: EventType = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"); setEvent(null);
      } finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const loadRelatedEvents = async () => {
      try {
        const allEvents = await fetchEvents();
        const filtered = allEvents.filter(evt => evt.id !== id).slice(0, 3);
        setRelatedEvents(filtered);
      } catch (err) { console.error("Error loading related events:", err); }
    };
    if (id) { loadRelatedEvents(); }
  }, [id]);

  const handleRegister = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); }
    else { navigate(`/apply/${id}`); }
  };
  
  if (loading) return <div className="text-center p-8">กำลังโหลดข้อมูลกิจกรรม...</div>;
  if (error) return <div className="text-center p-8 text-red-600">ผิดพลาด: {error}</div>;
  if (!event) return <div className="text-center p-8">ไม่พบกิจกรรม</div>;

  const imageUrl = event.images
    ? `${API_BASE_URL}${event.images}`
    : undefined;

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-10 md:mb-16">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{event.nameEvent}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">
              {event.detail || "ไม่มีรายละเอียด"}
            </p>
          </div>

          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={event.nameEvent}
                className="rounded-lg shadow-lg w-full h-auto object-contain" 
                onError={(e) => {
                    (e.target as HTMLImageElement).parentElement?.classList.add('hidden');
                }}
              />
            ) : (
                 <div className="rounded-lg shadow-lg w-full bg-gray-200 flex items-center justify-center aspect-video">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                 </div>
            )}
          </div>
        </div>

        {event.stations && event.stations.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">ศูนย์สอบ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {event.stations.map((station: Station, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md p-5 transition"
                >
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500 flex-shrink-0" />
                    {station.stationName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                      <p className="flex items-start">
                        <strong className="w-16 flex-shrink-0">ที่อยู่:</strong>
                        <span>{station.address}</span>
                      </p>
                      <p className="flex items-center">
                        <FaUsers className="mr-2 text-blue-500 flex-shrink-0" />
                        <strong className="w-14 flex-shrink-0">ความจุ:</strong>
                        <span>{station.capacity} คน</span>
                      </p>
                      <p className="flex items-center">
                        <FaHashtag className="mr-2 text-gray-500 flex-shrink-0" />
                        <strong className="w-14 flex-shrink-0">รหัสศูนย์:</strong>
                        <span>{station.code}</span>
                      </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
             <p className="text-gray-500 mt-6 text-center">ไม่มีข้อมูลศูนย์สอบสำหรับกิจกรรมนี้</p>
        )}

        <div className="text-center mt-12">
            <button
              onClick={handleRegister}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium transition shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              สมัครสอบ
            </button>
        </div>

        <div className="mt-20 pt-10 border-t">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
            กิจกรรมอื่น ๆ ที่น่าสนใจ
          </h2>
          {relatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">ไม่มีกิจกรรมอื่นในขณะนี้</p>
          )}
          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium shadow hover:shadow-lg"
            >
              ดูกิจกรรมทั้งหมด
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;