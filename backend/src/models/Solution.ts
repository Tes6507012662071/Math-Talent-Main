// src/api/registration/models/Solution.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISolution extends Document {
  eventId: string;
  fileUrl: string;
  uploadedAt: Date;
}

const SolutionSchema: Schema = new Schema({
  eventId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISolution>("Solution", SolutionSchema);
