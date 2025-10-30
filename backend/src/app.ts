import * as dotenv from 'dotenv';
dotenv.config(); // โหลด .env ก่อน

import express from "express";
import cors from "cors";
import path from "path"; // ต้อง Import path

// Import Routes
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import individualRegistrationRoutes from "./routes/individualRegistration.routes";
import adminRoutes from "./routes/admin.routes";
import solutionRoutes from "./routes/solution.routes";
// import slipRoutes from "./routes/slip.routes"; // (ถ้าไม่ใช้แล้ว ให้ลบ)
import attendanceRoutes from "./routes/attendance.routes";
import certificateRoutes from "./routes/certificate.route";
import landingRoutes from "./routes/landing.routes";
import surveyRoutes from './routes/survey.routes';
import surveyResponseRoutes from './routes/surveyResponse.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ‼️ Static File Serving (แก้ไขใหม่ทั้งหมด) ‼️ ---

// 1. ตรวจสอบ PUBLIC_ROOT_PATH
const PUBLIC_ROOT_PATH = process.env.PUBLIC_ROOT_PATH;
if (!PUBLIC_ROOT_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined. Check .env and dotenv setup.");
}
console.log(`[Static] Serving files from base: ${PUBLIC_ROOT_PATH}`);

// 2. เสิร์ฟรูปภาพ Event (จาก /api-images/events)
// Frontend จะเรียก: http://localhost:5000/api-images/events/event-xxx.jpg
const eventImagesPath = path.join(PUBLIC_ROOT_PATH, 'api-images', 'events');
app.use('/api-images/events', express.static(eventImagesPath));

// 3. เสิร์ฟไฟล์ Uploads อื่นๆ (จาก /api-uploads)
// Frontend จะเรียก: http://localhost:5000/api-uploads/slips/slip-xxx.pdf
const uploadsPath = path.join(PUBLIC_ROOT_PATH, 'api-uploads');
app.use('/api-uploads', express.static(uploadsPath));

// 4. ❌ ลบ Static Routes เก่าที่ไม่ถูกต้อง ❌
// app.use('/images', ...);
// app.use("/uploads/slips", ...);

// --- Routes (API Endpoints) ---
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/individual-registration", individualRegistrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/solutions", solutionRoutes);
// app.use("/api/slips", slipRoutes); // (ถ้าไม่ใช้แล้ว ให้ลบ)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/landing", landingRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/survey-response', surveyResponseRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

export default app;