// backend/src/controllers/event.controller.ts
import { Request, Response } from "express";
import Event from "../models/Event";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      nameEvent,
      detail,
      dateAndTime,
      location,
      registrationType,
      stations,
    } = req.body;

    if (!nameEvent || !dateAndTime) {
      return res.status(400).json({ success: false, message: "ต้องระบุชื่อเหตุการณ์และวันที่" });
    }

    let parsedStations;
    try {
      parsedStations = JSON.parse(stations);
    } catch {
      return res.status(400).json({ success: false, message: "รูปแบบ stations ไม่ถูกต้อง" });
    }

    if (!parsedStations || !Array.isArray(parsedStations) || parsedStations.length === 0) {
      return res.status(400).json({ success: false, message: "ต้องมีอย่างน้อย 1 ศูนย์สอบ" });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/images/events/${req.file.filename}`;
    }

    const year = new Date(dateAndTime).getFullYear();
    const eventCode = `MT${year.toString().slice(-2)}`;

    const newEvent = new Event({
      nameEvent,
      code: eventCode,
      detail,
      dateAndTime: new Date(dateAndTime),
      location,
      images: imageUrl,
      registrationType,
      stations: parsedStations,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "สร้างเหตุการณ์สำเร็จ",
       newEvent,
    });
  } catch (error: any) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};