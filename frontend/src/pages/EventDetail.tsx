import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt as FaCalendarAltRaw } from "react-icons/fa";
import { FaMapMarkerAlt as FaMapMarkerAltRaw } from "react-icons/fa";
import { FaClock as FaClockRaw } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const FaCalendarAlt = FaCalendarAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaMapMarkerAlt = FaMapMarkerAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaClock = FaClockRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface ExamSchedule {
  level: string;
  registerTime: string;
  examTime: string;
  examlocation: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // หรือ Date string
  location: string;
  registrationType: string;
  detail: string;
  image: string;
  examSchedules?: ExamSchedule[];
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/events/${id}`);  // ปรับ URL ให้ตรงกับ backend
        if (!res.ok) throw new Error(`เกิดข้อผิดพลาด: ${res.statusText}`);

        const data: Event = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate("/apply/" + id);
    }
  };

  if (loading) return <div className="text-center p-8">กำลังโหลดข้อมูลกิจกรรม...</div>;
  if (error) return <div className="text-center p-8 text-red-600">ผิดพลาด: {error}</div>;
  if (!event) return <div className="text-center p-8">ไม่พบกิจกรรม</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
            <p className="text-md text-gray-700 mb-6 whitespace-pre-line">{event.detail || event.description}</p>
          </div>

          <div>
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="rounded-lg shadow-lg w-full h-auto"
              />
            )}
          </div>
        </div>

        {event.examSchedules && event.examSchedules.length > 0 && (
          <>
            <p className="text-xl text-gray-700 mb-6">กำหนดการสอบ</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {event.examSchedules.map((exam, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md p-6 transition"
                >
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">
                    {exam.level}
                  </h3>
                  <div className="text-gray-600 text-sm flex items-center mb-1">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> ลงทะเบียน: {exam.registerTime}
                  </div>
                  <div className="text-gray-600 text-sm flex items-center mb-1">
                    <FaClock className="mr-2 text-green-500" /> เวลาสอบ: {exam.examTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-red-500" /> สถานที่สอบ: {exam.examlocation}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleRegister}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6"
        >
          สมัครสอบ
        </button>

        <h3 className="text-xl font-semibold text-[#003366] mb-6 text-center mt-16">
          Other Events
        </h3>
        {/* หากต้องการดึง upcoming events จาก API จริง ให้เพิ่ม fetch และ state อีกตัว */}
      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;
