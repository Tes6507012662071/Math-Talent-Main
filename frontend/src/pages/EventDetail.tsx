import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt as FaCalendarAltRaw } from "react-icons/fa";
import { FaMapMarkerAlt as FaMapMarkerAltRaw } from "react-icons/fa";
import { FaClock as FaClockRaw } from "react-icons/fa";
import { Event } from "../types/event";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FaCalendarAlt = FaCalendarAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaMapMarkerAlt = FaMapMarkerAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaClock = FaClockRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;




const mockEvents: Event[] = [
  {
    id: "1",
    title: "การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568",
    description: "การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568 สำหรับนักเรียนระดับประถมปลาย มัธยมศึกษาตอนต้น และมัธยมศึกษาตอนปลายทั่วประเทศ",
    date: "วันเสาร์ที่ 15 พฤศจิกายน 2568",
    location: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (กทม.)",
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

const upcomingEvents = [
    {
    title: 'Lorem',
    date: 'Lorem',
    location: 'Lorem',
    image: '/images/logo.jpg',
    },
    {
    title: 'Lorem',
    date: 'Lorem',
    location: 'Lorem',
    image: '/images/logo.jpg',
    },
    {
    title: 'Lorem',
    date: 'Lorem',
    location: 'Lorem',
    image: '/images/logo.jpg',
    },
    {
    title: 'Lorem',
    date: 'Lorem',
    location: 'Lorem',
    image: '/images/logo.jpg',
    },
    {
    title: 'Lorem',
    date: 'Lorem',
    location: 'Lorem',
    image: '/images/logo.jpg',
    },
  ];
  
const examSchedules = [
    {
        level: 'ระดับประถมศึกษาตอนปลาย',
        registerTime: '08.15 น.',
        examTime: '09.00 - 10.30 น.',
        examlocation: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    },
    {
        level: 'ระดับมัธยมศึกษาตอนต้น',
        registerTime: '10.15 น.',
        examTime: '11.00 - 12.30 น.',
        examlocation: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    },
    {
        level: 'ระดับมัธยมศึกษาตอนปลาย',
        registerTime: '12.15 น.',
        examTime: '13.00 - 14.30 น.',
        examlocation: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
            <p className="text-md text-gray-700 mb-6">
                📢 เปิดรับสมัครแล้ว! การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568 <br/>
                📍สมัครได้ตั้งแต่วันนี้ - 31 ตุลาคม 2568 <br/>
                📣 มูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ ร่วมกับ ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์ มจพ. ขอเชิญนักเรียนทุกระดับ เข้าร่วม การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568 <br/>
                📆 สอบวันเสาร์ที่ 15 พฤศจิกายน 2568 <br/>
                📍 ณ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (กทม.)<br/><br/>

                📋 การจัดการสอบวัดความรู้ทางคณิตศาสตร์ ข้อสอบประกอบด้วยปรนัย 25 ข้อ อัตนัย 5 ข้อ อ้างอิงตามสาระการเรียนรู้ทางคณิตศาสตร์แต่ละระดับ 

                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-base leading-relaxed">
                <li>ระดับประถมศึกษาตอนปลาย </li>
                <li>ระดับมัธยมศึกษาตอนต้น </li>
                <li>ระดับมัธยมศึกษาตอนปลาย </li>
                </ul><br/>

                📑 ผู้สมัครสอบได้รับ
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-base leading-relaxed">
                <li>ใบรับรองคะแนนการสอบวัดความรู้คณิตศาสตร์</li>
                <li>อาจได้รับเกียรติบัตรระดับดีเด่น หรือระดับดีมาก หรือระดับดี</li>
                </ul><br/>

                💰 ค่าลงทะเบียนตามช่วงเวลา
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-base leading-relaxed">
                <li>วันนี้ – 31 ก.ค. 68 👉 100 บาท/คน</li>
                <li> 1 ส.ค. – 30 ก.ย. 68 👉 150 บาท/คน</li>
                <li> 1 ต.ค. – 31 ต.ค. 68 👉 200 บาท/คน</li>
                </ul><br/>

                📬 สามารถลงทะเบียนได้แบบบุคคล (นักเรียนสมัครเอง) หรือสถานศึกษา (โรงเรียนสมัครให้กับนักเรียนทั้งห้อง)
            </p>
          </div>

          <div>
            <img
            src="/images/การสอบวัดความรู้ทางคณิตศาสตร์ 2568.jpg"
            alt="การสอบวัดความรู้ทางคณิตศาสตร์ 2568"
            className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>

        <div>
          <p className="text-xl text-gray-700 mb-6"> กำหนดการสอบ </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {examSchedules.map((exam, index) => (
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

            <Link to={`/apply/${event.id}`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6">
                สมัครสอบ
              </button>
            </Link>
        </div>


        <h3 className="text-xl font-semibold text-[#003366] mb-6 text-center mt-16">
          Other Events
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {upcomingEvents.map((event, index) => (
              <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
              <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover"
              />
              <div className="p-4">
                  <h4 className="text-md font-semibold text-blue-700 mb-2">
                  {event.title}
                  </h4>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {event.location}
                  </div>
              </div>
              </div>
          ))}
          </div>

      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;
