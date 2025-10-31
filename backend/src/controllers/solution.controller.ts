// backend/src/controllers/solution.controller.ts (ฉบับแก้ไข Prisma)
import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import Solution from "../models/Solution";

// 2. ✅ Import Prisma Client
import prisma from '../utils/prisma'; 

// (ฟังก์ชันนี้สำหรับ Admin Upload)
export const uploadSolution = async (req: Request, res: Response) => {
  try {
    // 3. ✅ ตรวจสอบไฟล์ (req.file มาจาก Multer ที่เราเพิ่งแก้)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { eventId } = req.body;
    
    // 4. ✅ สร้าง Path ที่ถูกต้อง (ตรงกับ Multer Middleware)
    const solutionFilePath = `/api-uploads/solutions/${req.file.filename}`;

    // 5. ‼️ Mongoose: new Solution().save() -> Prisma: .solution.create() ‼️
    const solution = await prisma.solution.create({
      data: {
        eventId: eventId,
        fileUrl: solutionFilePath,
        // uploadedAt ถูกตั้งค่า @default(now()) ใน Schema แล้ว
      }
    });

    res.json({ success: true, solution });
  } catch (err: any) {
    console.error("❌ Upload Solution Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// (ฟังก์ชันเดิม สำหรับหน้า SolutionPage)
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

// (ฟังก์ชันเดิม สำหรับ SolutionDetail ถ้ามี)
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