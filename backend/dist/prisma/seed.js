"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../src/generated/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding ...');
    const adminEmail = 'admin@mathtalent.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
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
    const landingContent = await prisma.landingContent.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            historyTitle: "ประวัติและความเป็นมา",
            historyContent: "โครงการจัดตั้งมูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ เป็นดำริของ รองศาสตราจารย์ ดร.อุทุมพร พลาวงศ์ หัวหน้าภาควิชาคณิตศาสตร์คนแรก (พ.ศ.๒๕๒๒-๒๕๒๖)  ที่จะสร้างประโยชน์ให้วงการคณิตศาสตร์ในประเทศไทย  จึงใช้โอกาสที่ภาควิชาคณิตศาสตร์และครอบครัวพลาวงศ์ร่วมกันจัดงานครบรอบ ๖๐ ปี ให้ รศ.ดร.อุทุมพร  พลาวงศ์  โดยผู้ร่วมงานทั้งศิษย์เก่า ศิษย์ปัจจุบัน และเพื่อนพ้องน้องพี่ สมทบทุนในการจัดตั้งมูลนิธิแทนการให้ของขวัญ  แล้วนำไปจดทะเบียนมูลนิธิเมื่อวันที่ ๑๔ ตุลาคม ๒๕๕๒ มีสถานที่ตั้งสำนักงานอยู่ที่ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์  มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
            objectiveTitle: "วัตถุประสงค์",
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
