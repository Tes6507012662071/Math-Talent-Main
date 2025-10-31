import { Request, Response } from "express";
import prisma from '../utils/prisma'; 


export const uploadSolution = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { eventId } = req.body;
    const solutionFilePath = `/api-uploads/solutions/${req.file.filename}`;
    const solution = await prisma.solution.create({
      data: {
        eventId: eventId,
        fileUrl: solutionFilePath,
      }
    });

    res.json({ success: true, solution });
  } catch (err: any) {
    console.error("❌ Upload Solution Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllSolutions = async (req: Request, res: Response) => {
  try {
    const solutions = await prisma.solution.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        event: {
          select: { nameEvent: true, dateAndTime: true }
        }
      }
    });
    res.json(solutions);
  } catch (err: any) {
    console.error("❌ Get Solutions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getSolutionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        event: { select: { nameEvent: true } }
      }
    });
    if (!solution) {
      return res.status(404).json({ message: "ไม่พบเฉลยนี้" });
    }
    res.json(solution);
  } catch (err: any) {
    console.error("❌ Get Solution Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};