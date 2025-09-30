import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import registrationRoutes from "./routes/registration.routes";
import individualRegistrationRoutes from "./routes/individualRegistration.routes";
import adminRoutes from "./routes/admin.routes";
import solutionRoutes from "./routes/solution.routes";
import slipRoutes from "./routes/slip.routes";
import path from "path";
import { fileURLToPath } from "url";
import attendanceRoutes from "./routes/attendance.routes";
import certificateRoutes from "./routes/certificate.route";
import landingRoutes from "./routes/landing.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/individual-registration", individualRegistrationRoutes);
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use("/api/admin", adminRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/slips", slipRoutes);
app.use("/uploads/slips", express.static(path.join(__dirname, "../uploads/slips")));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/landing", landingRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Test route to verify server is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/api`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

export default app;