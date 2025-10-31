import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitIndividualForm } from "../api/individualForm";
import { getEventById } from "../api/events";
import { Event } from "../types/event";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface FormValues {
  fullname: string;
  grade: string;
  school: string;
  station: string;
  phone: string;
  email: string;
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

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-center"><div className="text-xl">กำลังโหลดข้อมูลกิจกรรม...</div></div>
  );

  if (error || !event) return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-center">
      <div className="text-red-500 text-xl">{error || "ไม่พบกิจกรรม"}</div>
      <button onClick={() => navigate('/events')} className="mt-4 text-blue-600 hover:underline">
        กลับไปหน้ากิจกรรม
      </button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">สมัครสอบกิจกรรม: {event.nameEvent}</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">สมัครแบบบุคคล</h2>

          <div>
            <label className="block mb-1 font-medium">ชื่อ - นามสกุล</label>
            <input
              type="text" name="fullname" value={form.fullname} onChange={handleChange}
              className="w-full border px-3 py-2 rounded" required
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
              {(event.levels || []).map((level: string, index: number) => (
                <option key={index} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">โรงเรียน</label>
            <input
              type="text" name="school" value={form.school} onChange={handleChange}
              className="w-full border px-3 py-2 rounded" required
            />
          </div>

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
              type="text" name="phone" value={form.phone} onChange={handleChange}
              className="w-full border px-3 py-2 rounded" required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">อีเมล</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full border px-3 py-2 rounded" required
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
      <Footer />
    </>
  );
};

export default Apply;