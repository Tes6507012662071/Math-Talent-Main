// backend/src/models/IndividualRegistration.ts
import mongoose from 'mongoose';

const IndividualRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  fullname: { type: String, required: true },
  grade: { type: String, required: true },
  school: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ ข้อมูลศูนย์สอบที่เลือก
  stationName: { type: String, required: true }, // เช่น "ศูนย์สอบกรุงเทพฯ"

  // ✅ รหัสผู้สมัคร
  userCode: { type: String, unique: true, required: true },
  adminCode: { type: String, required: true }, // เช่น "012503030012"

  // ✅ Status tracking
  status: {
    type: String,
    enum: ["registered", "slip_uploaded", "verified", "exam_ready", "completed"],
    default: "registered",
  },
  slipUrl: { type: String },
  certificateUrl: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('IndividualRegistration', IndividualRegistrationSchema);