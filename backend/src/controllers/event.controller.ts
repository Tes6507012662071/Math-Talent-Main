// backend/controllers/eventController.ts
import { Request, Response } from "express";
import Event from "../models/Event";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
