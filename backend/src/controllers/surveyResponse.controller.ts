// controllers/surveyResponse.controller.ts
import { Request, Response } from 'express';
import SurveyResponse from '../models/SurveyResponse';
import Survey from '../models/Survey';

// Submit survey response
export const submitSurveyResponse = async (req: Request, res: Response) => {
  console.log("📥 Received survey submission:", {
    eventId: req.params.eventId,
    body: req.body
  });
  try {
    const { eventId } = req.params;
    const { surveyId, answers, userCode } = req.body;
    // ✅ ใช้ req.user.id ตามที่ authMiddleware กำหนด
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่" });
    }

    // Verify survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: "ไม่พบแบบสอบถาม" });
    }

    // Check if user already submitted
    const existingResponse = await SurveyResponse.findOne({ 
      surveyId, 
      userId 
    });

    if (existingResponse) {
      return res.status(400).json({ 
        message: "คุณได้ตอบแบบสอบถามนี้แล้ว",
        alreadySubmitted: true 
      });
    }

    // Create response
    const surveyResponse = await SurveyResponse.create({
      surveyId,
      eventId,
      userId,
      userCode,
      answers
    });

    res.json({ 
      success: true, 
      message: "บันทึกคำตอบสำเร็จ",
      response: surveyResponse 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "คุณได้ตอบแบบสอบถามนี้แล้ว",
        alreadySubmitted: true 
      });
    }
    console.error('Survey response error:', error);
    res.status(500).json({ message: "ไม่สามารถบันทึกคำตอบได้" });
  }
};

// Check if user has submitted survey
export const checkSurveyResponse = async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params;
    const userId = (req as any).user._id;

    const response = await SurveyResponse.findOne({ surveyId, userId });
    
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

    const responses = await SurveyResponse.find({ surveyId })
      .populate('userId', 'fullName email')
      .sort({ submittedAt: -1 });

    res.json({ 
      success: true, 
      count: responses.length,
      responses 
    });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};