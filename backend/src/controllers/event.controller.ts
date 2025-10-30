import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Models ทิ้ง
// import Event from "../models/Event";
// import Counter from "../models/Counter"; 
// 2. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma';
import { RegistrationType } from '../generated/client'; 

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    // 3. ‼️ Mongoose: .find().sort() -> Prisma: .findMany() + orderBy
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 4. ‼️ Mongoose: .findById() -> Prisma: .findUnique()
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        stations: true, // ✅ ดึง Stations (ศูนย์สอบ) ที่เป็น Nested Model มาด้วย
      }
    });

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
      stations, // (ยังเป็น JSON string)
    } = req.body;

    if (!nameEvent || !dateAndTime) {
      return res.status(400).json({ success: false, message: "ต้องระบุชื่อเหตุการณ์และวันที่" });
    }

    // --- (Logic การแปลง Stations) ---
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
      imageUrl = `/api-images/events/${req.file.filename}`;
    }
    // --- (Logic การแปลง Stations) ---


    // 5. ‼️ Mongoose: Counter.findOneAndUpdate -> Prisma: .counter.upsert() ‼️
    //    (ทำ Atomic Increment ($inc) ที่ถูกต้องใน Prisma)
    const counter = await prisma.counter.upsert({
      where: { name: 'eventId' },
      update: {
        seq: { increment: 1 } // ✅ $inc: { seq: 1 }
      },
      create: {
        name: 'eventId',
        seq: 1 // ✅ ถ้าไม่เจอ ให้สร้างและเริ่มที่ 1
      }
    });
    
    // --- (Logic การสร้าง Code) ---
    const nextCode = counter.seq;
    if (nextCode > 99) {
      return res.status(400).json({ 
        success: false, 
        message: "ถึงขีดจำกัดรหัสกิจกรรม (99)" 
      });
    }
    const code = String(nextCode).padStart(2, "0");
    // --- (Logic การสร้าง Code) ---


    // 6. ‼️ Mongoose: new Event().save() -> Prisma: .event.create() ‼️
    const newEvent = await prisma.event.create({
      data: {
        nameEvent,
        code,
        detail,
        dateAndTime: new Date(dateAndTime),
        location,
        images: imageUrl,
        registrationType: registrationType as RegistrationType,
        
        // 7. ✅ Fix: บังคับ Type และสร้าง Nested Model (Stations) พร้อมกัน
        stations: {
          createMany: {
            data: parsedStations.map((station: any) => ({
              // ‼️ ต้องมั่นใจว่า Field ตรงกับ model Station
              stationName: station.stationName,
              address: station.address,
              capacity: parseInt(station.capacity), // ✅ ใช้ parseInt เพื่อความมั่นใจว่าเป็น Int
              code: parseInt(station.code),         // ✅ ใช้ parseInt เพื่อความมั่นใจว่าเป็น Int
            })),
            skipDuplicates: true // ป้องกัน Error ในระดับ Nested
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "สร้างเหตุการณ์สำเร็จ",
      newEvent,
    });
  } catch (error: any) {
    console.error("Create event error:", error);
    // ‼️ ควรดู Log ใน Terminal ของ Backend ว่า Prisma Error Code คืออะไร (เช่น P2002) ‼️
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

    // 8. ‼️ Mongoose: .findById() -> Prisma: .findUnique()
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "ไม่พบกิจกรรมนี้" });
    }

    // 9. สร้าง updateData
    const updateData: any = {
      nameEvent,
      detail,
      dateAndTime: dateAndTime ? new Date(dateAndTime) : existingEvent.dateAndTime,
      location,
      registrationType: registrationType as RegistrationType,
    };
    
    if (req.file) {
      updateData.images = `/api-images/events/${req.file.filename}`;
    }

    // 10. ‼️ (สำคัญ) อัปเดต Stations (ลบของเก่าทิ้งทั้งหมด, สร้างใหม่ทั้งหมด) ‼️
    if (stations) {
      try {
        const parsedStations = JSON.parse(stations);
        if (!Array.isArray(parsedStations) || parsedStations.length === 0) {
          return res.status(400).json({ success: false, message: "ต้องมีอย่างน้อย 1 ศูนย์สอบ" });
        }
        
        updateData.stations = {
          deleteMany: {}, // ✅ ลบ Stations เก่าทั้งหมดของ Event นี้
          createMany: {   // ✅ สร้าง Stations ใหม่ทั้งหมด
            data: parsedStations.map((station: any) => ({
              stationName: station.stationName,
              address: station.address,
              capacity: parseInt(station.capacity), 
              code: parseInt(station.code),         
            })),
            skipDuplicates: true
          }
        };
      } catch {
        return res.status(400).json({ success: false, message: "รูปแบบ stations ไม่ถูกต้อง" });
      }
    }

    // 11. ‼️ Mongoose: .findByIdAndUpdate() -> Prisma: .update()
    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: updateData,
    });

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