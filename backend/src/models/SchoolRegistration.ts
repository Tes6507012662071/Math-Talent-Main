import mongoose, { Document } from "mongoose";

interface StudentInfo {
  fullname: string;
  grade: string;
}

export interface ISchoolRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  schoolName: string;
  contact: string;
  students: StudentInfo[];
}

const schoolRegistrationSchema = new mongoose.Schema<ISchoolRegistration>({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schoolName: { type: String, required: true },
  contact: { type: String, required: true },
  students: [
    {
      fullname: { type: String, required: true },
      grade: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const SchoolRegistration = mongoose.model<ISchoolRegistration>(
  "SchoolRegistration",
  schoolRegistrationSchema
);
export default SchoolRegistration;
