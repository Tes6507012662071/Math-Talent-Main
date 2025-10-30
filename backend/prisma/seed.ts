// backend/prisma/seed.ts

import { PrismaClient } from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. Seed Admin User ---
  const adminEmail = 'admin@mathtalent.com';
  const adminPassword = 'admin123'; // 👈 (อย่าลืมเปลี่ยนรหัส)
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log(`Created/Updated admin user: ${adminUser.email}`);

  
  // --- 2. Seed Landing Page Content (Singleton) ---
  const landingContent = await prisma.landingContent.upsert({
    where: { id: 1 }, 
    update: {},       
    create: {         
      id: 1,
      historyTitle: "ประวัติและความเป็นมา",
      historyContent: "โครงการจัดตั้งมูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ เป็นดำริของ รองศาสตราจารย์ ดร.อุทุมพร พลาวงศ์ หัวหน้าภาควิชาคณิตศาสตร์คนแรก (พ.ศ.๒๕๒๒-๒๕๒๖)  ที่จะสร้างประโยชน์ให้วงการคณิตศาสตร์ในประเทศไทย  จึงใช้โอกาสที่ภาควิชาคณิตศาสตร์และครอบครัวพลาวงศ์ร่วมกันจัดงานครบรอบ ๖๐ ปี ให้ รศ.ดร.อุทุมพร  พลาวงศ์  โดยผู้ร่วมงานทั้งศิษย์เก่า ศิษย์ปัจจุบัน และเพื่อนพ้องน้องพี่ สมทบทุนในการจัดตั้งมูลนิธิแทนการให้ของขวัญ  แล้วนำไปจดทะเบียนมูลนิธิเมื่อวันที่ ๑๔ ตุลาคม ๒๕๕๒ มีสถานที่ตั้งสำนักงานอยู่ที่ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์  มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
      objectiveTitle: "วัตถุประสงค์",
      // (แก้เป็น Json)
      objectives: [
        "เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่นักเรียน นิสิต นักศึกษา โดยให้รางวัลผู้ที่มีผลการเรียนคณิตศาสตร์ดีเด่นประจำปี  หรือให้ทุนการศึกษาผู้มีศักยภาพทางคณิตศาสตร์",
        "เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่ครู อาจารย์  และนักคณิตศาสตร์ โดยให้รางวัลผู้ที่มีผลงานด้านคณิตศาสตร์ดีเด่นประจำปี",
        "เพื่อสนับสนุนหรือดำเนินกิจกรรมที่จะก่อให้เกิดความก้าวหน้าทางคณิตศาสตร์ในประเทศไทย",
        "เพื่อดำเนินการหรือร่วมมือกับองค์กรอื่นๆ ในกิจกรรมที่ส่งเสริมหรือสนับสนุนความก้าวหน้าของคณิตศาสตร์ในประเทศไทย",
        "เพื่อดำเนินการหรือร่วมมือกับองค์การการกุศลอื่นๆ  เพื่อสาธารณประโยชน์",
        "ไม่ดำเนินการเกี่ยวข้องกับการเมืองแต่ประการใด"
      ]
    }
  });
  console.log('Created/Updated landing content.');


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });