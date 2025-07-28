import mongoose, { Document } from "mongoose";

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  type?: "individual" | "school";   // ✅ เปลี่ยนให้ optional
  status: "pending" | "slip_uploaded" | "verified" | "exam_ready" | "completed";
  slipUrl?: string;
  certificateUrl?: string;
  schoolName?: string;
  excelFileUrl?: string;
}

const registrationSchema = new mongoose.Schema<IRegistration>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: ["individual", "school"], required: false },  // ✅ now optional
    status: {
      type: String,
      enum: ["pending", "slip_uploaded", "verified", "exam_ready", "completed"],
      default: "pending",  // ✅ default
    },
    slipUrl: { type: String },
    certificateUrl: { type: String },
    schoolName: { type: String },
    excelFileUrl: { type: String },
  },
  { timestamps: true }
);

const Registration = mongoose.model<IRegistration>("Registration", registrationSchema);
export default Registration;
