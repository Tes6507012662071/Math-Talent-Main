import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '../generated/client'; 


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
    
    const mapQuestionsToPrismaData = (q: any) => ({
      question: q.question,
      type: q.type,
      options: q.options !== undefined && q.options !== null
        ? q.options as Prisma.InputJsonValue
        : Prisma.JsonNull
    });
    

    const survey = await prisma.survey.upsert({
      where: { eventId: eventId },
      update: { 
        title, 
        isActive, 
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

export const getSurveyByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    const survey = await prisma.survey.findFirst({
      where: { 
        eventId: eventId, 
        isActive: true
      },
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