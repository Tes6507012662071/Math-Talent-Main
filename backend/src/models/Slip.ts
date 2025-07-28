// models/Slip.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISlip extends Document {
  eventId: string;
  userId: string;
  slipUrl: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: Date;
}

const slipSchema = new Schema<ISlip>({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  slipUrl: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISlip>("Slip", slipSchema);
