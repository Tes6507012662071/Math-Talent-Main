import * as dotenv from 'dotenv';
dotenv.config(); 

import express from "express";
import cors from "cors";
import path from "path"; 
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import individualRegistrationRoutes from "./routes/individualRegistration.routes";
import adminRoutes from "./routes/admin.routes";
import solutionRoutes from "./routes/solution.routes";
import attendanceRoutes from "./routes/attendance.routes";
import certificateRoutes from "./routes/certificate.route";
import landingRoutes from "./routes/landing.routes";
import surveyRoutes from './routes/survey.routes';
import surveyResponseRoutes from './routes/surveyResponse.routes';
import exportRoutes from './routes/export.routes';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

const PUBLIC_ROOT_PATH = process.env.PUBLIC_ROOT_PATH;
if (!PUBLIC_ROOT_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined. Check .env and dotenv setup.");
}
console.log(`[Static] Serving files from base: ${PUBLIC_ROOT_PATH}`);

const eventImagesPath = path.join(PUBLIC_ROOT_PATH, 'api-images', 'events');
app.use('/api-images/events', express.static(eventImagesPath));

const uploadsPath = path.join(PUBLIC_ROOT_PATH, 'api-uploads');
app.use('/api-uploads', express.static(uploadsPath));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/individual-registration", individualRegistrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/landing", landingRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/survey-response', surveyResponseRoutes);
app.use('/api/export', exportRoutes);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

export default app;