import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '../generated/client'; 

export const submitSurveyResponse = async (req: Request, res: Response) => {
  console.log("📥 Received survey submission:", {
    eventId: req.params.eventId,
    body: req.body
  });
  
  try {
    const { surveyId, answers, userCode } = req.body;
    const { eventId } = req.params; 
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่" });
    }
    if (!surveyId || !answers || !userCode || !eventId) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
    if (!survey) {
      return res.status(404).json({ message: "ไม่พบแบบสอบถาม" });
    }

    const answersData = answers.map((answer: any) => {
      const answerValue = answer.answer; 
      return {
        questionIndex: answer.questionIndex,
        question: answer.question,
        answer: answerValue ? answerValue as Prisma.JsonValue : Prisma.JsonNull
      };
    });

    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: surveyId,
        eventId: eventId,
        userId: userId,
        userCode: userCode,
        answers: { 
          createMany: {
            data: answersData, 
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