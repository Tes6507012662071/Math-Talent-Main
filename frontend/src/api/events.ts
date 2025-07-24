import { Event } from "../types/event";

export const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch("http://localhost:5000/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const res = await fetch(`http://localhost:5000/api/events/${id}`);
  if (!res.ok) return undefined;
  return res.json();
};


