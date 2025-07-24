import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { Event } from "../types/event";
import { fetchEvents } from "../api/events"; // สมมติเก็บฟังก์ชัน API นี้ในไฟล์นี้

const Landing: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        setError("ไม่สามารถโหลดกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) return <div>กำลังโหลดกิจกรรม...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Navbar />
      {/* About Section */}
      <section id="about" className="px-6 py-12 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-20">
            {/* เนื้อหา */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-2xl font-extrabold text-[#003366] mb-4">
                <span className="block">ประวัติและความเป็นมา</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 space-y-2 text-base leading-relaxed">
                โครงการจัดตั้งมูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ เป็นดำริของ รองศาสตราจารย์ ดร.อุทุมพร พลาวงศ์ หัวหน้าภาควิชาคณิตศาสตร์คนแรก (พ.ศ.๒๕๒๒-๒๕๒๖)  ที่จะสร้างประโยชน์ให้วงการคณิตศาสตร์ในประเทศไทย  จึงใช้โอกาสที่ภาควิชาคณิตศาสตร์และครอบครัวพลาวงศ์ร่วมกันจัดงานครบรอบ ๖๐ ปี ให้ รศ.ดร.อุทุมพร  พลาวงศ์  โดยผู้ร่วมงานทั้งศิษย์เก่า ศิษย์ปัจจุบัน และเพื่อนพ้องน้องพี่ สมทบทุนในการจัดตั้งมูลนิธิแทนการให้ของขวัญ  แล้วนำไปจดทะเบียนมูลนิธิเมื่อวันที่ ๑๔ ตุลาคม ๒๕๕๒ 
                มีสถานที่ตั้งสำนักงานอยู่ที่ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์  มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
              </p>
            </div>
            {/* รูปภาพ */}
            <div className="w-full lg:w-1/2">
              <img
                src="/images/cat.gif"
                alt="Mathematics Illustration"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
        {/* วัตถุประสงค์ */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-8">
          <h2 className="text-2xl font-extrabold text-[#003366] mb-4">วัตถุประสงค์</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-3 text-base leading-relaxed">
            <li>เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่นักเรียน นิสิต นักศึกษา โดยให้รางวัลผู้ที่มีผลการเรียนคณิตศาสตร์ดีเด่นประจำปี  หรือให้ทุนการศึกษาผู้มีศักยภาพทางคณิตศาสตร์ </li>
            <li>เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่ครู อาจารย์  และนักคณิตศาสตร์ โดยให้รางวัลผู้ที่มีผลงานด้านคณิตศาสตร์ดีเด่นประจำปี</li>
            <li>เพื่อสนับสนุนหรือดำเนินกิจกรรมที่จะก่อให้เกิดความก้าวหน้าทางคณิตศาสตร์ในประเทศไทย</li>
            <li>เพื่อดำเนินการหรือร่วมมือกับองค์กรอื่นๆ ในกิจกรรมที่ส่งเสริมหรือสนับสนุนความก้าวหน้าของคณิตศาสตร์ในประเทศไทย  </li>
            <li>เพื่อดำเนินการหรือร่วมมือกับองค์การการกุศลอื่นๆ  เพื่อสาธารณประโยชน์</li>
            <li>ไม่ดำเนินการเกี่ยวข้องกับการเมืองแต่ประการใด</li>
          </ul>
        </div>
      </section>

      {/* Events Section */}
      <div className="lg:text-center bg-gray-50 py-12">
        <h2 className="text-3xl text-[#003366] font-semibold tracking-wide uppercase">Events</h2>
      </div>

      <section id="events" className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
