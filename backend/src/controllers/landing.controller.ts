// backend/src/controllers/landing.controller.ts (เวอร์ชัน Prisma)
import { Request, Response } from 'express';
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import LandingContent from '../models/LandingContent'; 
// 2. ✅ Import Prisma Client เข้ามาแทน
import prisma from '../utils/prisma'; 

// ✅ ดึงข้อมูล Landing (สาธารณะ)
export const getLandingContent = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 GET /landing - Fetching landing content');

    // 3. ‼️ เปลี่ยน Logic การดึงข้อมูล ‼️
    // (เรา "รู้" ว่าข้อมูลอยู่ที่ id: 1 เสมอ จากไฟล์ seed.ts)
    const landing = await prisma.landingContent.findUnique({
      where: { id: 1 },
    });

    if (!landing) {
      console.warn('❌ Landing content (id: 1) not found! Did the seed run?');
      return res.status(404).json({ message: 'ไม่พบข้อมูล Landing' });
    }

    // 4. ✅ (ปรับปรุง) ส่งข้อมูลที่ได้จาก Prisma กลับไปตรงๆ ได้เลย
    console.log('✅ Landing content fetched successfully');
    res.json(landing);

  } catch (err) {
    console.error('❌ Error in getLandingContent:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะโหลดข้อมูล' });
  }
};

// ✅ อัปเดตข้อมูล Landing (เฉพาะ admin)
export const updateLandingContent = async (req: Request, res: Response) => {
  const { historyTitle, historyContent, objectiveTitle, objectives } = req.body;

  console.log('📝 PUT /landing - Update request from admin');

  // ตรวจสอบข้อมูลเบื้องต้น (เหมือนเดิม)
  if (!Array.isArray(objectives)) {
    console.warn('❌ Invalid objectives format - not an array');
    return res.status(400).json({ message: 'objectives ต้องเป็น array ของข้อความ' });
  }

  try {
    // 5. ‼️ เปลี่ยน Logic การอัปเดต ‼️
    // (ใช้ 'update' โดยระบุ id: 1 ตรงๆ)
    const updated = await prisma.landingContent.update({
      where: { id: 1 },
      data: {
        historyTitle,
        historyContent,
        objectiveTitle,
        objectives, // Prisma (Json) รับ Array นี้ได้เลย
      },
    });

    // 6. ✅ (ปรับปรุง) ส่งข้อมูลที่อัปเดตแล้วกลับไปตรงๆ
    console.log('✅ Landing content updated successfully');
    res.json(updated);

  } catch (err) {
    console.error('❌ Error in updateLandingContent:', err);
    res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
};