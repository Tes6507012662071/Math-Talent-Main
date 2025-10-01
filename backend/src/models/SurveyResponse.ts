// models/SurveyResponse.ts
import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema({
  surveyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Survey', 
    required: true 
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userCode: { 
    type: String, 
    required: true 
  },
  answers: [{
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true } // Can be string or array
  }],
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Ensure one response per user per survey
surveyResponseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

export default mongoose.model('SurveyResponse', surveyResponseSchema);