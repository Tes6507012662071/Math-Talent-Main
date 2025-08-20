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
import attendanceRoutes from "./routes/attendance.routes";
import certificateRoutes from "./routes/certificate.route";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/individual-registration", individualRegistrationRoutes);
app.use("/images", express.static("public/images"));
app.use("/api/admin", adminRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/slips", slipRoutes);
app.use("/uploads/slips", express.static(path.join(__dirname, "../uploads/slips")));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);

export default app;
