// src/api/registration/models/Slip.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISlip extends Document {
  fullname: string;
  eventId: string;
  status: string;
  slipUrl?: string;
}

const SlipSchema = new Schema<ISlip>({
  fullname: { type: String, required: true },
  eventId: { type: String, required: true },
  status: { type: String, default: "registered" },
  slipUrl: { type: String },
});

export default mongoose.model<ISlip>("Slip", SlipSchema);
