// backend/src/models/Event.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IStation {
  stationName: string;
  address: string;
  capacity: number;
  code: number;
}

export interface IEvent extends Document {
  nameEvent: string;
  detail?: string;
  dateAndTime: Date;
  location?: string;
  images?: string;
  registrationType: 'individual' | 'school';
  code: string; // ✅ เพิ่ม field นี้
  stations: IStation[];
}

const StationSchema = new Schema({
  stationName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 0 },
  code: { type: Number, required: true }
}, { _id: false });

const EventSchema = new Schema({
  nameEvent: { type: String, required: true, trim: true },
  detail: { type: String },
  dateAndTime: { type: Date, required: true },
  location: { type: String },
  images: { type: String },
  registrationType: { 
    type: String, 
    enum: ['individual', 'school'], 
    default: 'individual' 
  },
  code: { type: String, required: true },
  stations: {
    type: [StationSchema],
    required: true,
    validate: [function(arr: IStation[]) {
      return arr.length > 0;
    }, 'ต้องมีอย่างน้อย 1 ศูนย์สอบ']
  }
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);