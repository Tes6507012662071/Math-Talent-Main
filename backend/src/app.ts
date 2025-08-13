import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import registrationRoutes from "./routes/registration.routes";
import individualRegistrationRoutes from "./routes/individualRegistration.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/individual-registration", individualRegistrationRoutes);
app.use("/images", express.static("public/images"));
app.use("/api/admin", adminRoutes);
export default app;
