"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const individualRegistration_routes_1 = __importDefault(require("./routes/individualRegistration.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const solution_routes_1 = __importDefault(require("./routes/solution.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const certificate_route_1 = __importDefault(require("./routes/certificate.route"));
const landing_routes_1 = __importDefault(require("./routes/landing.routes"));
const survey_routes_1 = __importDefault(require("./routes/survey.routes"));
const surveyResponse_routes_1 = __importDefault(require("./routes/surveyResponse.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express_1.default.json());
const PUBLIC_ROOT_PATH = process.env.PUBLIC_ROOT_PATH;
if (!PUBLIC_ROOT_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined. Check .env and dotenv setup.");
}
console.log(`[Static] Serving files from base: ${PUBLIC_ROOT_PATH}`);
const eventImagesPath = path_1.default.join(PUBLIC_ROOT_PATH, 'api-images', 'events');
app.use('/api-images/events', express_1.default.static(eventImagesPath));
const uploadsPath = path_1.default.join(PUBLIC_ROOT_PATH, 'api-uploads');
app.use('/api-uploads', express_1.default.static(uploadsPath));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/events", events_routes_1.default);
app.use("/api/individual-registration", individualRegistration_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/solutions", solution_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/certificates", certificate_route_1.default);
app.use("/api/landing", landing_routes_1.default);
app.use('/api/survey', survey_routes_1.default);
app.use('/api/survey-response', surveyResponse_routes_1.default);
app.use('/api/export', export_routes_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
const PORT = process.env.PORT || 5000;
exports.default = app;
