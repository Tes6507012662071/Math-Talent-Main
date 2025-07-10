import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;
