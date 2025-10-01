// backend/src/models/Counter.ts
import { Schema, model } from 'mongoose';

const CounterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0, min: 0 }
});

export default model('Counter', CounterSchema);