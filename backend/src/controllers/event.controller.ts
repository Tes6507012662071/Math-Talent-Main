// backend/controllers/eventController.ts
import { Request, Response } from "express";
import Event from "../models/Event";
import mongoose from "mongoose";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "รหัสกิจกรรมไม่ถูกต้อง" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "ไม่พบกิจกรรม" });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
