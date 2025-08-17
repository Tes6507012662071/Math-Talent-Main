// src/api/registration/controllers/solution.controller.ts
import { Request, Response } from "express";
import Solution from "../models/Solution";

export const uploadSolution = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { eventId } = req.body;

    const solution = new Solution({
      eventId,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    await solution.save();

    res.json({ success: true, solution });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSolutions = async (_req: Request, res: Response) => {
  try {
    const solutions = await Solution.find();
    res.json(solutions);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
