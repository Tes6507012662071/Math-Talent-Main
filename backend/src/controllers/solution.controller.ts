// backend/src/controllers/solution.controller.ts (เวอร์ชัน Prisma)
import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import Solution from "../models/Solution";

// 2. ✅ Import Prisma Client เข้ามาแทน
import prisma from '../utils/prisma'; 

export const uploadSolution = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { eventId } = req.body;
    
    // 3. ‼️ เปลี่ยน Logic การบันทึก: new Solution().save() -> prisma.solution.create() ‼️
    const solution = await prisma.solution.create({
      data: {
        eventId,
        // (NOTE: ต้องมั่นใจว่า Multer ถูกตั้งค่าให้บันทึกไฟล์ไปที่ที่ถูกต้อง)
        fileUrl: `/uploads/${req.file.filename}`, 
      }
    });

    res.json({ success: true, solution });
  } catch (err: any) {
    console.error("❌ Upload Solution Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSolutions = async (_req: Request, res: Response) => {
  try {
    // 4. ‼️ เปลี่ยน .find() เป็น .findMany() ‼️
    const solutions = await prisma.solution.findMany();
    res.json(solutions);
  } catch (err: any) {
    console.error("❌ Get Solutions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};