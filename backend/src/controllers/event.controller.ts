// backend/src/controllers/event.controller.ts
import { Request, Response } from "express";
import Event from "../models/Event";
import Counter from "../models/Counter"; // ✅ import Counter

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
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    }
    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
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

    // ✅ สร้าง `code` แบบอัตโนมัติด้วย Counter (เช่น "01", "02")
    const counter = await Counter.findOneAndUpdate(
      { name: 'eventId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextCode = counter.seq;
    if (nextCode > 99) {
      return res.status(400).json({ 
        success: false, 
        message: "ถึงขีดจำกัดรหัสกิจกรรม (99)" 
      });
    }

    const code = String(nextCode).padStart(2, "0"); // เช่น "01", "02"

    const newEvent = new Event({
      nameEvent,
      code, // ✅ ใช้ `code` ตาม schema ที่คุณมี
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

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nameEvent,
      detail,
      dateAndTime,
      location,
      registrationType,
      stations
    } = req.body;

    // ตรวจสอบว่า event มีอยู่
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "ไม่พบกิจกรรมนี้" });
    }

    // แปลง stations
    let parsedStations = existingEvent.stations;
    if (stations) {
      try {
        parsedStations = JSON.parse(stations);
      } catch {
        return res.status(400).json({ success: false, message: "รูปแบบ stations ไม่ถูกต้อง" });
      }
    }

    // สร้างข้อมูลอัปเดต
    const updateData: any = {
      nameEvent,
      detail,
      dateAndTime: dateAndTime ? new Date(dateAndTime) : existingEvent.dateAndTime,
      location,
      registrationType,
      stations: parsedStations
    };

    // อัปโหลดรูปภาพใหม่ (ถ้ามี)
    if (req.file) {
      updateData.images = `/images/events/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "อัปเดตกิจกรรมสำเร็จ",
      event: updatedEvent
    });
  } catch (error: any) {
    console.error("Update event error:", error);
    res.status(500).json({ success: false, message: "ไม่สามารถอัปเดตกิจกรรมได้" });
  }
};