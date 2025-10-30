import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { Event } from "../types/event";
import { fetchEvents } from "../api/events";
import { fetchLandingContent, LandingData } from "../api/landing";

const Landing: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [landing, setLanding] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log("🔍 เริ่มโหลดข้อมูล Landing และ Events...");
      
      try {
        const [eventsData, landingData] = await Promise.all([
          fetchEvents(),
          fetchLandingContent()
        ]);
        
        console.log("✅ โหลด Events สำเร็จ:", eventsData);
        console.log("✅ โหลด Landing สำเร็จ:", landingData);
        
        setEvents(eventsData);
        setLanding(landingData);
      } catch (err) {
        console.error("❌ เกิดข้อผิดพลาดขณะโหลดข้อมูล:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        console.log("✅ กระบวนการโหลดเสร็จสิ้น");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Debug: ดูค่า state ปัจจุบัน
  console.log("📊 State ปัจจุบัน:", { loading, error, landing, events });

  if (loading) {
    console.log("⏳ ยังอยู่ในสถานะ loading...");
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }

  if (error) {
    console.log("💥 เกิด error:", error);
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!landing) {
    console.log("⚠️ ไม่พบข้อมูล landing (ค่าเป็น null หรือ undefined)");
    return <div>ไม่พบข้อมูล</div>;
  }

  console.log("✅ กำลังเรนเดอร์หน้า Landing ด้วยข้อมูล:", { landing, events });

  return (
    <div>
      <Navbar />
      
      {/* About Section */}
      <section id="about" className="px-6 py-12 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-20">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-2xl font-extrabold text-[#003366] mb-4">
                {landing.historyTitle}
              </h1>
              <p className="mt-3 text-base text-gray-500 leading-relaxed">
                {landing.historyContent}
              </p>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src="/images/logo.jpg"
                alt="Mathematics Illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-8">
          <h2 className="text-2xl font-extrabold text-[#003366] mb-4">
            {landing.objectiveTitle}
          </h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-3 text-base leading-relaxed">
            {landing.objectives.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Events Section */}
      <div className="lg:text-center bg-gray-50 py-12">
        <h2 className="text-3xl text-[#003366] font-semibold tracking-wide uppercase">กิจกรรม</h2>
      </div>

      <section id="events" className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;