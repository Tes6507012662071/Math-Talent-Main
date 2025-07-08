import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { Event } from "../types/event";

const Landing: React.FC = () => {
  const events: Event[] = [
    {
        id: "1",
        title: "การแข่งขันคณิตศาสตร์ระดับมัธยมต้น",
        description: "กิจกรรมแข่งขันคณิตศาสตร์ระดับชาติ ประจำปี 2025",
        date: "12 สิงหาคม 2025",
        location: "กรุงเทพมหานคร",
        registrationType: "individual",
        detail: ""
    },
    {
        id: "2",
        title: "สอบคัดเลือกทุนคณิตศาสตร์",
        description: "เปิดสอบคัดเลือกนักเรียนทุน Math Talent Foundation",
        date: "5 กันยายน 2025",
        location: "เชียงใหม่",
        registrationType: "individual",
        detail: ""
    },
  ];

  return (
    <div>
      <Navbar />

      <section id="about" className="px-6 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">เกี่ยวกับ MATH TALENT FOUNDATION</h2>
          <p className="text-gray-700">
            มูลนิธิเพื่อส่งเสริมและพัฒนาความสามารถทางคณิตศาสตร์ของเยาวชนไทย
            โดยมีเป้าหมายในการสร้างเวทีให้เด็กไทยได้แสดงศักยภาพและก้าวสู่ระดับสากล
          </p>
        </div>
      </section>

      <section id="events" className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">กิจกรรมที่เปิดรับสมัคร</h2>
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
