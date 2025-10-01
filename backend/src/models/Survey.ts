import { Schema, model, Document } from 'mongoose';

export interface ISurveyQuestion {
  question: string;
  type: 'text' | 'radio' | 'checkbox'; // หรือเพิ่ม option
  options?: string[]; // ใช้กับ radio/checkbox
}

export interface ISurvey extends Document {
  eventId: string; // เชื่อมกับ Event
  title: string; // เช่น "แบบสอบถามหลังสอบ"
  questions: ISurveyQuestion[];
  isActive: boolean; // เปิด/ปิดการกรอก
}

const SurveyQuestionSchema = new Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['text', 'radio', 'checkbox'], default: 'text' },
  options: [{ type: String }]
}, { _id: false });

const SurveySchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  title: { type: String, default: "แบบสอบถามหลังสอบ" },
  questions: [SurveyQuestionSchema],
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default model<ISurvey>('Survey', SurveySchema);