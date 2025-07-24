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
  customId: string;
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
    customId: { type: String, unique: true, required: true }, // ต้องเพิ่มถ้าใช้
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    registrationType: { type: String, enum: ["individual", "school"], required: true },
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
    customId: "1",
    title: "การสอบวัดความรู้ทางคณิตศาสตร์ประจำปี 2568",
    description: "สอบคณิตศาสตร์ระดับชาติ...",
    date: new Date("2025-11-15"),
    location: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    registrationType: "individual",
    image: "/images/math-exam.jpg",
    detail: "รายละเอียดแบบยาว...",
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
    customId: "2",
    title: "สอบคัดเลือกทุนคณิตศาสตร์",
    description: "ทุน Math Talent Foundation...",
    date: new Date("2025-09-05"),
    location: "เชียงใหม่",
    registrationType: "individual",
    image: "/images/math-scholarship.jpg",
    detail: "รายละเอียดทุน...",
  },
];



