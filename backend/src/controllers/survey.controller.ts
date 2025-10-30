// backend/src/controllers/survey.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '../generated/client'; // Import Prisma module for Error Code and JsonValue Type

// สร้าง/อัปเดต survey สำหรับ event
export const upsertSurvey = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { title, questions, isActive } = req.body;

  try {
    if (!eventId) {
      return res.status(400).json({ message: 'ต้องระบุ Event ID ใน URL' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'ต้องมีอย่างน้อย 1 คำถาม' });
    }
    
    // Helper function สำหรับการแปลง Array/null ให้เป็น Prisma.InputJsonValue ที่ถูกต้อง
    const mapQuestionsToPrismaData = (q: any) => ({
      question: q.question,
      type: q.type,
      // ✅ แก้ Final Type Error: ใช้ Prisma.JsonNull สำหรับค่าที่เป็น null และ Prisma.InputJsonValue สำหรับค่าที่ไม่ใช่ null
      options: q.options !== undefined && q.options !== null
        ? q.options as Prisma.InputJsonValue
        : Prisma.JsonNull
    });
    
    // ‼️ LOGIC: Prisma .upsert() พร้อม Nested Write ‼️
    const survey = await prisma.survey.upsert({
      where: { eventId: eventId },
      update: { 
        title, 
        isActive, 
        // 4. ✅ แก้ปัญหา: ลบของเก่าทิ้งแล้วสร้างใหม่ (Nested Update/Delete)
        questions: {
          deleteMany: {}, 
          createMany: {
            data: questions.map(mapQuestionsToPrismaData)
          }
        }
      },
      create: { 
        eventId,
        title, 
        isActive,
        // 6. ✅ สร้างพร้อมกับ Questions (Nested Create)
        questions: {
          createMany: {
            data: questions.map(mapQuestionsToPrismaData)
          }
        }
      },
    });

    res.json({ success: true, survey });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({ message: 'เกิดข้อผิดพลาด: Survey นี้ถูกสร้างแล้ว' });
    }
    console.error("❌ upsertSurvey error:", error);
    res.status(500).json({ message: "ไม่สามารถบันทึกแบบสอบถามได้" });
  }
};

// ดึง survey สำหรับ event
export const getSurveyByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    const survey = await prisma.survey.findFirst({
      where: { 
        eventId: eventId, 
        isActive: true
      },
      // ✅ ต้อง Include Questions มาด้วยเพื่อให้ Frontend เห็น
      include: {
          questions: true
      }
    });

    res.json(survey);
  } catch (error) {
    console.error("❌ getSurveyByEvent error:", error);
    res.status(500).json({ message: "โหลดแบบสอบถามไม่ได้" });
  }
};