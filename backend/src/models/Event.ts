/*import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;*/

import mongoose, { Document } from "mongoose";

interface ExamSchedule {
  level: string;
  registerTime: string;
  examTime: string;
  examlocation: string;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  registrationType: string;
  image: string;
  detail: string;
  examSchedules?: ExamSchedule[];
}

const examScheduleSchema = new mongoose.Schema<ExamSchedule>(
  {
    level: { type: String, required: true },
    registerTime: { type: String, required: true },
    examTime: { type: String, required: true },
    examlocation: { type: String, required: true },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    registrationType: {
      type: String,
      enum: ["individual", "school"],
      required: true,
    },
    image: { type: String },
    detail: { type: String },
    examSchedules: [examScheduleSchema],
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;

// 👇 เพิ่ม sample data สำหรับ seed
export const sampleEvents = [
  {
    title: "การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568",
    description: "สอบคณิตศาสตร์ระดับชาติ...",
    date: new Date("2025-11-15"),
    location: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    registrationType: "individual",
    image: "/images/การสอบวัดความรู้ทางคณิตศาสตร์ 2568.jpg",
    detail: `📢 เปิดรับสมัครแล้ว! การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568 
             📍สมัครได้ตั้งแต่วันนี้ - 31 ตุลาคม 2568 
             📣 มูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ ร่วมกับ ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์ มจพ.
              ขอเชิญนักเรียนทุกระดับ เข้าร่วม การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568
              🗓 สอบวันเสาร์ที่ 15 พฤศจิกายน 2568
              📍 ณ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (กทม.)
              📌 แบ่งสอบ 3 ระดับ
              🔹 ประถมปลาย
              🔹 มัธยมต้น
              🔹 มัธยมปลาย
              📘 ข้อสอบประกอบด้วย ปรนัย 25 ข้อ + อัตนัย 5 ข้อ
              ✍️ เน้นวัดความรู้ตามสาระการเรียนรู้ของแต่ละระดับ
              🎉 ผู้เข้าสอบทุกคนจะได้รับ ใบรับรองคะแนน
              🏅 มีสิทธิ์ลุ้นรับ เกียรติบัตรระดับดีเด่น หรือระดับดีมาก หรือระดับดี
              💰 ค่าลงทะเบียนตามช่วงเวลา
              📅 วันนี้ – 31 ก.ค. 68 👉 100 บาท/คน
              📅 1 ส.ค. – 30 ก.ย. 68 👉 150 บาท/คน
              📅 1 ต.ค. – 31 ต.ค. 68 👉 200 บาท/คน
              ⏰ ยิ่งสมัครเร็ว ยิ่งคุ้ม!
              📬 สามารถลงทะเบียนได้แบบบุคคล (นักเรียนสมัครเอง) หรือสถานศึกษา (โรงเรียนสมัครให้กับนักเรียนทั้งห้อง)
              `,
    examSchedules: [
      {
        level: "ประถมปลาย",
        registerTime: "08:15",
        examTime: "09:00 - 10:30",
        examlocation: "สถานที่สอบ A",
      },
      {
        level: "มัธยมต้น",
        registerTime: "10:15",
        examTime: "11:00 - 12:30",
        examlocation: "สถานที่สอบ A",
      },
    ],
  },
  {
    title: "สอบคัดเลือกทุนคณิตศาสตร์",
    description: "ทุน Math Talent Foundation...",
    date: new Date("2025-09-05"),
    location: "เชียงใหม่",
    registrationType: "individual",
    image: "/images/math-scholarship.jpg",
    detail: "รายละเอียดทุน...",
  },
];
