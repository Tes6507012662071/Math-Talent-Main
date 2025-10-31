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
exports.exportApplicants = exports.exportSurveyResponses = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const XLSX = __importStar(require("xlsx"));
const exportSurveyResponses = async (req, res) => {
    try {
        const { eventId } = req.params;
        const survey = await prisma_1.default.survey.findUnique({
            where: { eventId },
            include: {
                questions: { orderBy: { id: 'asc' } }
            }
        });
        if (!survey) {
            return res.status(404).json({ message: "ไม่พบแบบสอบถามสำหรับ Event นี้" });
        }
        const responses = await prisma_1.default.surveyResponse.findMany({
            where: { surveyId: survey.id },
            include: {
                user: { select: { name: true, email: true } },
                answers: { orderBy: { questionIndex: 'asc' } }
            }
        });
        const headers = ["User Code", "Name", "Email", "Submit Time"];
        survey.questions.forEach(q => { headers.push(q.question); });
        const exportData = responses.map(response => {
            const row = {
                "User Code": response.userCode,
                "Name": response.user?.name || '',
                "Email": response.user?.email || '',
                "Submit Time": response.submittedAt.toLocaleString('th-TH'),
            };
            response.answers.forEach(answer => {
                let answerValue = answer.answer;
                try {
                    const parsed = JSON.parse(answerValue);
                    if (Array.isArray(parsed)) {
                        answerValue = parsed.join(', ');
                    }
                }
                catch (e) { }
                row[answer.question] = answerValue;
            });
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=survey_export_${eventId}.xlsx`);
        res.send(buffer);
    }
    catch (error) {
        console.error("❌ Export Survey Error:", error);
        res.status(500).json({ message: "Export ล้มเหลว", error: error.message });
    }
};
exports.exportSurveyResponses = exportSurveyResponses;
const exportApplicants = async (req, res) => {
    try {
        const { eventId } = req.params;
        const applicants = await prisma_1.default.individualRegistration.findMany({
            where: { eventId: eventId },
            orderBy: {
                createdAt: 'asc'
            }
        });
        if (applicants.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้สมัครสำหรับ Event นี้" });
        }
        const exportData = applicants.map(app => ({
            'รหัสผู้สมัคร (User Code)': app.userCode,
            'รหัสแอดมิน (Admin Code)': app.adminCode,
            'ชื่อ-นามสกุล': app.fullname,
            'ระดับชั้น': app.grade,
            'โรงเรียน': app.school,
            'ศูนย์สอบ': app.stationName,
            'เบอร์โทร': app.phone,
            'อีเมล': app.email,
            'สถานะ': app.status,
            'วันที่สมัคร': app.createdAt.toLocaleString('th-TH')
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=applicants_export_${eventId}.xlsx`);
        res.send(buffer);
    }
    catch (error) {
        console.error("❌ Export Applicants Error:", error);
        res.status(500).json({ message: "Export ล้มเหลว", error: error.message });
    }
};
exports.exportApplicants = exportApplicants;
