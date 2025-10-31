import { Request, Response } from 'express';
import prisma from '../utils/prisma'; 


export const getLandingContent = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 GET /landing - Fetching landing content');

    const landing = await prisma.landingContent.findUnique({
      where: { id: 1 },
    });

    if (!landing) {
      console.warn('❌ Landing content (id: 1) not found! Did the seed run?');
      return res.status(404).json({ message: 'ไม่พบข้อมูล Landing' });
    }

    console.log('✅ Landing content fetched successfully');
    res.json(landing);

  } catch (err) {
    console.error('❌ Error in getLandingContent:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะโหลดข้อมูล' });
  }
};

export const updateLandingContent = async (req: Request, res: Response) => {
  const { historyTitle, historyContent, objectiveTitle, objectives } = req.body;

  console.log('📝 PUT /landing - Update request from admin');

  if (!Array.isArray(objectives)) {
    console.warn('❌ Invalid objectives format - not an array');
    return res.status(400).json({ message: 'objectives ต้องเป็น array ของข้อความ' });
  }

  try {
    const updated = await prisma.landingContent.update({
      where: { id: 1 },
      data: {
        historyTitle,
        historyContent,
        objectiveTitle,
        objectives, 
      },
    });

    console.log('✅ Landing content updated successfully');
    res.json(updated);

  } catch (err) {
    console.error('❌ Error in updateLandingContent:', err);
    res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
};