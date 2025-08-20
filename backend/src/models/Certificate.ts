import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  userCode: string;          // รหัสผู้เข้าสอบ
  eventId: string;           // อ้างอิง Event
  certificateUrl: string;    // path ของ PDF
  uploadedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  userCode: { type: String, required: true },
  eventId: { type: String, required: true },  
  certificateUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICertificate>("Certificate", CertificateSchema);
