import { Request, Response } from 'express';
import Survey from '../models/Survey';

// สร้าง/อัปเดต survey สำหรับ event
export const upsertSurvey = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { title, questions, isActive } = req.body;

    const survey = await Survey.findOneAndUpdate(
      { eventId },
      { title, questions, isActive },
      { new: true, upsert: true }
    );

    res.json({ success: true, survey });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถบันทึกแบบสอบถามได้" });
  }
};

// ดึง survey สำหรับ event
export const getSurveyByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const survey = await Survey.findOne({ eventId, isActive: true });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: "โหลดแบบสอบถามไม่ได้" });
  }
};