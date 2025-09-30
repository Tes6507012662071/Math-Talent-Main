// Apply.tsx (ส่วนที่แก้ไข)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitIndividualForm } from "../api/individualForm";
import { getEventById } from "../api/events";
import { Event } from "../types/event"; // ✅ ใช้ interface ใหม่

interface FormValues {
  fullname: string;
  grade: string;
  school: string;
  station: string; // ชื่อศูนย์สอบ
  phone: string;
  email: string;
  note: string;
}

const Apply: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormValues>({
    fullname: "",
    grade: "",
    school: "",
    station: "",
    phone: "",
    email: "",
    note: "",
  });

  useEffect(() => {
    if (!eventId) {
      setError("ไม่พบ ID กิจกรรม");
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error("โหลดกิจกรรมไม่ได้:", err);
        setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาล็อกอินก่อนสมัคร");
      return;
    }

    try {
      await submitIndividualForm(token, { eventId: eventId!, ...form });
      alert("สมัครสำเร็จ!");
      navigate(`/events/${eventId}`);
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่ทราบสาเหตุ"));
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <div className="text-xl">กำลังโหลดข้อมูลกิจกรรม...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <div className="text-red-500 text-xl">{error || "ไม่พบกิจกรรม"}</div>
        <button 
          onClick={() => navigate('/events')}
          className="mt-4 text-blue-600 hover:underline"
        >
          กลับไปหน้ากิจกรรม
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* ✅ ใช้ nameEvent แทน title */}
      <h1 className="text-2xl font-bold mb-6">สมัครสอบกิจกรรม: {event.nameEvent}</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded space-y-4">
        <h2 className="text-xl font-bold">สมัครแบบบุคคล</h2>

        <div>
          <label className="block mb-1 font-medium">ชื่อ - นามสกุล</label>
          <input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">ระดับชั้น</label>
          <select
            name="grade"
            value={form.grade}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- เลือกระดับชั้น --</option>
            {/* ❌ ลบส่วนนี้ออก ถ้าไม่มี level ใน stations */}
            {/* เพราะ stations ใหม่ไม่มี field "level" */}
            <option value="ประถมศึกษาตอนปลาย">ประถมศึกษาตอนปลาย</option>
            <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
            <option value="มัธยมศึกษาตอนปลาย">มัธยมศึกษาตอนปลาย</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">โรงเรียน</label>
          <input
            type="text"
            name="school"
            value={form.school}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* ✅ ใช้ stations แทน examSchedules */}
        <div>
          <label className="block mb-1 font-medium">ศูนย์สอบ</label>
          <select
            name="station"
            value={form.station}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- เลือกศูนย์สอบ --</option>
            {(event.stations || []).map((station, index) => (
              <option key={index} value={station.stationName}>
                {station.stationName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">อีเมล</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">หมายเหตุเพิ่มเติม</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ส่งสมัครสอบ
        </button>
      </form>
    </div>
  );
};

export default Apply;