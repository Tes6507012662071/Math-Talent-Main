import mongoose, { Document, Schema } from "mongoose";

export type RegistrationStatus = "pending_payment" | "waiting_verification" | "waiting_exam" | "completed";

export interface IRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: string;
  registrationType: "individual" | "school";
  data: any; // store form data or excel info here
  status: RegistrationStatus;
  slipUrl?: string;
  certificateUrl?: string;
}

const registrationSchema = new Schema<IRegistration>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: String, required: true },
  registrationType: { type: String, enum: ["individual", "school"], required: true },
  data: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ["pending_payment", "waiting_verification", "waiting_exam", "completed"], default: "pending_payment" },
  slipUrl: { type: String },
  certificateUrl: { type: String },
}, { timestamps: true });

export default mongoose.model<IRegistration>("Registration", registrationSchema);
