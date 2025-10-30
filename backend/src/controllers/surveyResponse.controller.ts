// backend/src/controllers/surveyResponse.controller.ts (ฉบับแก้ไข)
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
// 1. ✅ Import Prisma (สำหรับ Error Code และ Json Type)
import { Prisma } from '../generated/client'; 

// Submit survey response
export const submitSurveyResponse = async (req: Request, res: Response) => {
  console.log("📥 Received survey submission:", {
    eventId: req.params.eventId,
    body: req.body
  });
  
  try {
    const { surveyId, answers, userCode } = req.body;
    const { eventId } = req.params; // eventId จาก URL
    const userId = (req as any).user?.id; // userId จาก Middleware

    if (!userId) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่" });
    }
    if (!surveyId || !answers || !userCode || !eventId) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    // (Validate survey exists - Optional but good)
    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
    if (!survey) {
      return res.status(404).json({ message: "ไม่พบแบบสอบถาม" });
    }

    // 2. ‼️ [แก้ไข] แปลง 'answers' (Array) ให้เป็น Data ที่ Prisma ต้องการ ‼️
    const answersData = answers.map((answer: any) => {
      // (Frontend ส่ง 'answer' ที่เป็น String หรือ JSON String มาแล้ว)
      const answerValue = answer.answer; 
      return {
        questionIndex: answer.questionIndex,
        question: answer.question,
        // ✅ ใช้ Type Cast เป็น Prisma.JsonValue (เหมือนกับที่เราทำใน survey.controller.ts)
        answer: answerValue ? answerValue as Prisma.JsonValue : Prisma.JsonNull
      };
    });

    // 3. ‼️ สร้าง SurveyResponse พร้อม Nested Answers ‼️
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: surveyId,
        eventId: eventId,
        userId: userId,
        userCode: userCode,
        answers: { // ✅ สร้าง Relation 'answers' (ตาราง SurveyAnswer)
          createMany: {
            data: answersData, // 👈 ใช้ข้อมูลที่แปลง Type แล้ว
            skipDuplicates: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "บันทึกคำตอบสำเร็จ",
      response: surveyResponse
    });
  } catch (error: any) {
    // 4. ‼️ ดักจับ Error P2002 (Unique Constraint) ‼️
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({
        message: "คุณได้ตอบแบบสอบถามนี้แล้ว",
        alreadySubmitted: true
      });
    }
    console.error('❌ Survey response error:', error);
    res.status(500).json({ message: "ไม่สามารถบันทึกคำตอบได้" });
  }
};

// Check if user has submitted survey
export const checkSurveyResponse = async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params;
    const userId = (req as any).user.id;

    const response = await prisma.surveyResponse.findFirst({
      where: { surveyId, userId }
    });

    res.json({
      hasSubmitted: !!response,
      response
    });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถตรวจสอบสถานะได้" });
  }
};

// Get all responses for a survey (Admin only)
export const getSurveyResponses = async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params;

    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({
      success: true,
      count: responses.length,
      responses
    });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};