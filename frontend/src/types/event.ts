// frontend/src/types/event.ts

// ✅ Interface สำหรับ Station (ศูนย์สอบ)
export interface Station {
  id?: string; // ID ของ Station (อาจจะไม่ถูกส่งมาเสมอไป)
  stationName: string;
  address: string;
  capacity: number;
  code: number;
}

// ✅ Interface สำหรับ Event (แก้ไข Field ให้ตรงกับ Prisma)
export interface Event {
  id: string; // ‼️ ไม่ใช่ _id
  nameEvent: string; // ‼️ ไม่ใช่ title
  detail?: string;
  dateAndTime: string;
  location?: string;
  registrationType: 'individual' | 'school';
  images?: string; // ‼️ ไม่ใช่ image
  levels?: string[];
  stations: Station[]; // ‼️ ใช้ Station[] ไม่ใช่ ExamSchedule[]
  createdAt?: string; // (Optional)
  updatedAt?: string; // (Optional)
}