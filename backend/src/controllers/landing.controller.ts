// backend/src/controllers/landing.controller.ts
import { Request, Response } from 'express';
import LandingContent from '../models/LandingContent';

// ✅ ดึงข้อมูล Landing (สาธารณะ)
export const getLandingContent = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 GET /landing - Fetching landing content');
    
    // ✅ ตอนนี้ TypeScript รู้จัก getSingleton แล้ว
    const landing = await LandingContent.getSingleton();
    
    const response = {
      historyTitle: landing.historyTitle,
      historyContent: landing.historyContent,
      objectiveTitle: landing.objectiveTitle,
      objectives: landing.objectives
    };
    
    console.log('✅ Landing content fetched successfully');
    res.json(response);
  } catch (err) {
    console.error('❌ Error in getLandingContent:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะโหลดข้อมูล' });
  }
};

// ✅ อัปเดตข้อมูล Landing (เฉพาะ admin)
export const updateLandingContent = async (req: Request, res: Response) => {
  const { historyTitle, historyContent, objectiveTitle, objectives } = req.body;
  
  console.log('📝 PUT /landing - Update request from admin:', req.user?.id);
  
  // ตรวจสอบข้อมูลเบื้องต้น
  if (!Array.isArray(objectives)) {
    console.warn('❌ Invalid objectives format - not an array');
    return res.status(400).json({ message: 'objectives ต้องเป็น array ของข้อความ' });
  }

  try {
    const updated = await LandingContent.findOneAndUpdate(
      {},
      { historyTitle, historyContent, objectiveTitle, objectives },
      { new: true, upsert: true }
    );

    const response = {
      historyTitle: updated.historyTitle,
      historyContent: updated.historyContent,
      objectiveTitle: updated.objectiveTitle,
      objectives: updated.objectives
    };

    console.log('✅ Landing content updated successfully');
    res.json(response);
  } catch (err) {
    console.error('❌ Error in updateLandingContent:', err);
    res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
};