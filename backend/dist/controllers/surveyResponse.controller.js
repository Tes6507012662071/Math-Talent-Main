"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurveyResponses = exports.checkSurveyResponse = exports.submitSurveyResponse = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const submitSurveyResponse = async (req, res) => {
    console.log("📥 Received survey submission:", {
        eventId: req.params.eventId,
        body: req.body
    });
    try {
        const { surveyId, answers, userCode } = req.body;
        const { eventId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่" });
        }
        if (!surveyId || !answers || !userCode || !eventId) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
        }
        const survey = await prisma_1.default.survey.findUnique({ where: { id: surveyId } });
        if (!survey) {
            return res.status(404).json({ message: "ไม่พบแบบสอบถาม" });
        }
        const answersData = answers.map((answer) => {
            const answerValue = answer.answer;
            return {
                questionIndex: answer.questionIndex,
                question: answer.question,
                answer: answerValue ? answerValue : client_1.Prisma.JsonNull
            };
        });
        const surveyResponse = await prisma_1.default.surveyResponse.create({
            data: {
                surveyId: surveyId,
                eventId: eventId,
                userId: userId,
                userCode: userCode,
                answers: {
                    createMany: {
                        data: answersData,
                        skipDuplicates: true
                    }
                }
            }
        });
        res.json({
            success: true,
            message: "บันทึกคำตอบสำเร็จ",
            response: surveyResponse
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({
                message: "คุณได้ตอบแบบสอบถามนี้แล้ว",
                alreadySubmitted: true
            });
        }
        console.error('❌ Survey response error:', error);
        res.status(500).json({ message: "ไม่สามารถบันทึกคำตอบได้" });
    }
};
exports.submitSurveyResponse = submitSurveyResponse;
const checkSurveyResponse = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const userId = req.user.id;
        const response = await prisma_1.default.surveyResponse.findFirst({
            where: { surveyId, userId }
        });
        res.json({
            hasSubmitted: !!response,
            response
        });
    }
    catch (error) {
        res.status(500).json({ message: "ไม่สามารถตรวจสอบสถานะได้" });
    }
};
exports.checkSurveyResponse = checkSurveyResponse;
const getSurveyResponses = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const responses = await prisma_1.default.surveyResponse.findMany({
            where: { surveyId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { submittedAt: 'desc' },
        });
        res.json({
            success: true,
            count: responses.length,
            responses
        });
    }
    catch (error) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
    }
};
exports.getSurveyResponses = getSurveyResponses;
