// src/api/registration/controllers/slip.controller.ts
import { Request, Response } from "express";
import Slip from "../models/Slip";

export const getSlipsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const slips = await Slip.find({ eventId });
    res.json(slips);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSlipStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const slip = await Slip.findByIdAndUpdate(id, { status }, { new: true });
    res.json(slip);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
