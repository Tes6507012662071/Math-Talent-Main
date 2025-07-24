import { Event } from "../types/event";

export const fetchEvents = async () => {
  const res = await fetch("http://localhost:5000/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export const getEvents = async (): Promise<Event[]> => {
  return [
    {
      id: "1",
      title: "สอบแข่งขันคณิตศาสตร์ ม.ต้น",
      description: "แข่งขันวัดความสามารถระดับประเทศ สำหรับ ม.ต้น",
      date: "2025-08-12",
      location: "กรุงเทพฯ",
      detail: "จัดขึ้นที่มหาวิทยาลัย X อาคาร Y เวลา 9:00-15:00",
      registrationType: "individual"
    },
    {
      id: "2",
      title: "ทุนคณิตศาสตร์ระดับมัธยม",
      description: "สอบคัดเลือกเยาวชนเข้ารับทุน Math Talent",
      date: "2025-09-05",
      location: "เชียงใหม่",
      detail: "ศูนย์สอบจังหวัดเชียงใหม่ ณ โรงเรียน Z",
      registrationType: "individual"
    },
  ];
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const events = await getEvents();
  return events.find((e) => e.id === id);
};

