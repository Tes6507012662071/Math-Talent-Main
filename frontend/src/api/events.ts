// frontend/src/api/events.ts
import { Event } from "../types/event"; 

const API_URL = 'http://localhost:5000/api';

export const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error("ไม่สามารถโหลดกิจกรรมได้");
  return res.json();
};

export const getEventById = async (id: string): Promise<Event> => {
  const res = await fetch(`${API_URL}/events/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("ไม่พบกิจกรรม");
    }
    throw new Error("เกิดข้อผิดพลาดในการโหลดกิจกรรม");
  }
  return res.json();
};