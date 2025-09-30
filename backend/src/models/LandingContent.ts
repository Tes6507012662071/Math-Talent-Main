// backend/src/models/LandingContent.ts
import { Schema, model, Model, Document } from 'mongoose';

export interface ILandingContent extends Document {
  historyTitle: string;
  historyContent: string;
  objectiveTitle: string;
  objectives: string[];
}

// ✅ ประกาศ interface สำหรับ static methods
export interface ILandingContentModel extends Model<ILandingContent> {
  getSingleton(): Promise<ILandingContent>;
}

const landingSchema = new Schema<ILandingContent>({
  historyTitle: { type: String, required: true },
  historyContent: { type: String, required: true },
  objectiveTitle: { type: String, required: true },
  objectives: [{ type: String, required: true }]
});

// ✅ กำหนด static method
landingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      historyTitle: "ประวัติและความเป็นมา",
      historyContent: "โครงการจัดตั้งมูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ เป็นดำริของ รองศาสตราจารย์ ดร.อุทุมพร พลาวงศ์ หัวหน้าภาควิชาคณิตศาสตร์คนแรก (พ.ศ.๒๕๒๒-๒๕๒๖)  ที่จะสร้างประโยชน์ให้วงการคณิตศาสตร์ในประเทศไทย  จึงใช้โอกาสที่ภาควิชาคณิตศาสตร์และครอบครัวพลาวงศ์ร่วมกันจัดงานครบรอบ ๖๐ ปี ให้ รศ.ดร.อุทุมพร  พลาวงศ์  โดยผู้ร่วมงานทั้งศิษย์เก่า ศิษย์ปัจจุบัน และเพื่อนพ้องน้องพี่ สมทบทุนในการจัดตั้งมูลนิธิแทนการให้ของขวัญ  แล้วนำไปจดทะเบียนมูลนิธิเมื่อวันที่ ๑๔ ตุลาคม ๒๕๕๒ มีสถานที่ตั้งสำนักงานอยู่ที่ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์  มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
      objectiveTitle: "วัตถุประสงค์",
      objectives: [
        "เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่นักเรียน นิสิต นักศึกษา โดยให้รางวัลผู้ที่มีผลการเรียนคณิตศาสตร์ดีเด่นประจำปี  หรือให้ทุนการศึกษาผู้มีศักยภาพทางคณิตศาสตร์",
        "เพื่อส่งเสริมอัจฉริยภาพทางคณิตศาสตร์แก่ครู อาจารย์  และนักคณิตศาสตร์ โดยให้รางวัลผู้ที่มีผลงานด้านคณิตศาสตร์ดีเด่นประจำปี",
        "เพื่อสนับสนุนหรือดำเนินกิจกรรมที่จะก่อให้เกิดความก้าวหน้าทางคณิตศาสตร์ในประเทศไทย",
        "เพื่อดำเนินการหรือร่วมมือกับองค์กรอื่นๆ ในกิจกรรมที่ส่งเสริมหรือสนับสนุนความก้าวหน้าของคณิตศาสตร์ในประเทศไทย",
        "เพื่อดำเนินการหรือร่วมมือกับองค์การการกุศลอื่นๆ  เพื่อสาธารณประโยชน์",
        "ไม่ดำเนินการเกี่ยวข้องกับการเมืองแต่ประการใด"
      ]
    });
  }
  return doc;
};

// ✅ ส่งออก model พร้อม type
export default model<ILandingContent, ILandingContentModel>('LandingContent', landingSchema);