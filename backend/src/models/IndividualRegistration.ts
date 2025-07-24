// models/IndividualRegistration.ts
import mongoose from 'mongoose';

const IndividualRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // ✅ ใช้ ObjectId
  fullname: { type: String, required: true },
  grade: { type: String, required: true },
  school: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  note: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('IndividualRegistration', IndividualRegistrationSchema);
