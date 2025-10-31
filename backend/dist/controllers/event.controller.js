"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEvent = exports.createEvent = exports.getEventById = exports.getAllEvents = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllEvents = async (req, res) => {
    try {
        const events = await prisma_1.default.event.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllEvents = getAllEvents;
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await prisma_1.default.event.findUnique({
            where: { id },
            include: {
                stations: true,
            }
        });
        if (!event) {
            return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
        }
        res.json(event);
    }
    catch (error) {
        console.error("Get event error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getEventById = getEventById;
const createEvent = async (req, res) => {
    try {
        const { nameEvent, detail, dateAndTime, location, registrationType, stations, levels } = req.body;
        if (!nameEvent || !dateAndTime) {
            return res.status(400).json({ success: false, message: "ต้องระบุชื่อเหตุการณ์และวันที่" });
        }
        let parsedStations;
        try {
            parsedStations = JSON.parse(stations);
        }
        catch {
            return res.status(400).json({ success: false, message: "รูปแบบ stations ไม่ถูกต้อง" });
        }
        if (!parsedStations || !Array.isArray(parsedStations) || parsedStations.length === 0) {
            return res.status(400).json({ success: false, message: "ต้องมีอย่างน้อย 1 ศูนย์สอบ" });
        }
        let parsedLevels = [];
        if (levels) {
            try {
                parsedLevels = JSON.parse(levels);
                if (!Array.isArray(parsedLevels)) {
                    return res.status(400).json({ success: false, message: "รูปแบบ Levels ต้องเป็น Array" });
                }
            }
            catch (e) {
                return res.status(400).json({ success: false, message: "รูปแบบ Levels (JSON) ไม่ถูกต้อง" });
            }
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/api-images/events/${req.file.filename}`;
        }
        const counter = await prisma_1.default.counter.upsert({
            where: { name: 'eventId' },
            update: { seq: { increment: 1 } },
            create: { name: 'eventId', seq: 1 }
        });
        const nextCode = counter.seq;
        if (nextCode > 99) {
            return res.status(400).json({ success: false, message: "ถึงขีดจำกัดรหัสกิจกรรม (99)" });
        }
        const code = String(nextCode).padStart(2, "0");
        const newEvent = await prisma_1.default.event.create({
            data: {
                nameEvent,
                code,
                detail,
                dateAndTime: new Date(dateAndTime),
                location,
                images: imageUrl,
                registrationType: registrationType,
                levels: parsedLevels,
                stations: {
                    createMany: {
                        data: parsedStations.map((station) => ({
                            stationName: station.stationName,
                            address: station.address,
                            capacity: parseInt(station.capacity),
                            code: parseInt(station.code),
                        })),
                        skipDuplicates: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: "สร้างเหตุการณ์สำเร็จ",
            newEvent,
        });
    }
    catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameEvent, detail, dateAndTime, location, registrationType, stations, levels } = req.body;
        const existingEvent = await prisma_1.default.event.findUnique({ where: { id } });
        if (!existingEvent) {
            return res.status(404).json({ success: false, message: "ไม่พบกิจกรรมนี้" });
        }
        const updateData = {
            nameEvent,
            detail,
            dateAndTime: dateAndTime ? new Date(dateAndTime) : existingEvent.dateAndTime,
            location,
            registrationType: registrationType,
        };
        if (req.file) {
            updateData.images = `/api-images/events/${req.file.filename}`;
        }
        if (levels) {
            try {
                const parsedLevels = JSON.parse(levels);
                if (!Array.isArray(parsedLevels)) {
                    return res.status(400).json({ success: false, message: "รูปแบบ Levels ต้องเป็น Array" });
                }
                updateData.levels = parsedLevels;
            }
            catch (e) {
                return res.status(400).json({ success: false, message: "รูปแบบ Levels (JSON) ไม่ถูกต้อง" });
            }
        }
        if (stations) {
            try {
                const parsedStations = JSON.parse(stations);
                if (!Array.isArray(parsedStations) || parsedStations.length === 0) {
                    return res.status(400).json({ success: false, message: "ต้องมีอย่างน้อย 1 ศูนย์สอบ" });
                }
                updateData.stations = {
                    deleteMany: {},
                    createMany: {
                        data: parsedStations.map((station) => ({
                            stationName: station.stationName,
                            address: station.address,
                            capacity: parseInt(station.capacity),
                            code: parseInt(station.code),
                        })),
                        skipDuplicates: true
                    }
                };
            }
            catch {
                return res.status(400).json({ success: false, message: "รูปแบบ stations ไม่ถูกต้อง" });
            }
        }
        const updatedEvent = await prisma_1.default.event.update({
            where: { id: id },
            data: updateData,
        });
        res.json({
            success: true,
            message: "อัปเดตกิจกรรมสำเร็จ",
            event: updatedEvent
        });
    }
    catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ success: false, message: "ไม่สามารถอัปเดตกิจกรรมได้" });
    }
};
exports.updateEvent = updateEvent;
