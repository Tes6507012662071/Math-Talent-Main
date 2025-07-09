import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt as FaCalendarAltRaw } from "react-icons/fa";
import { FaMapMarkerAlt as FaMapMarkerAltRaw } from "react-icons/fa";
import { Event } from "../types/event";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FaCalendarAlt = FaCalendarAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaMapMarkerAlt = FaMapMarkerAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;



const mockEvents: Event[] = [
  {
    id: "1",
    title: "การแข่งขันคณิตศาสตร์ระดับมัธยมต้น",
    description: "กิจกรรมแข่งขันคณิตศาสตร์ระดับชาติ ประจำปี 2025 สำหรับนักเรียนระดับมัธยมต้นทั่วประเทศ",
    date: "12 สิงหาคม 2025",
    location: "กรุงเทพมหานคร",
    registrationType: "individual",
    detail: ""
  },
  {
    id: "2",
    title: "สอบคัดเลือกทุนคณิตศาสตร์",
    description: "เปิดสอบคัดเลือกนักเรียนทุน Math Talent Foundation สำหรับผู้มีศักยภาพสูงทางคณิตศาสตร์",
    date: "5 กันยายน 2025",
    location: "เชียงใหม่",
    registrationType: "individual",
    detail: ""
  },
];

const EventDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    // จำลอง fetch จาก API หรือ backend จริงในอนาคต
    const found = mockEvents.find((e) => e.id === id);
    if (found) setEvent(found);
  }, [id]);

  const handleRegister = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate("/register-event/" + id); // หรือหน้าแบบฟอร์มเลือกบุคคล/โรงเรียน
    }
  };

  if (!event) return <div className="text-center p-8">ไม่พบกิจกรรม</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
        <p className="text-gray-700 mb-2">
          วันที่จัดกิจกรรม: {event.date}
        </p>
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          {event.date}
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          {event.location}
        </div>
        <p className="text-gray-700 mb-4">สถานที่: {event.location}</p>
        <p className="text-gray-800">{event.description}</p>
        <Link to={`/apply/${event.id}`}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6">
            สมัครสอบ
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;
