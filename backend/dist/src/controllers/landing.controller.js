"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLandingContent = exports.getLandingContent = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getLandingContent = async (_req, res) => {
    try {
        console.log('🔍 GET /landing - Fetching landing content');
        const landing = await prisma_1.default.landingContent.findUnique({
            where: { id: 1 },
        });
        if (!landing) {
            console.warn('❌ Landing content (id: 1) not found! Did the seed run?');
            return res.status(404).json({ message: 'ไม่พบข้อมูล Landing' });
        }
        console.log('✅ Landing content fetched successfully');
        res.json(landing);
    }
    catch (err) {
        console.error('❌ Error in getLandingContent:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะโหลดข้อมูล' });
    }
};
exports.getLandingContent = getLandingContent;
const updateLandingContent = async (req, res) => {
    const { historyTitle, historyContent, objectiveTitle, objectives } = req.body;
    console.log('📝 PUT /landing - Update request from admin');
    if (!Array.isArray(objectives)) {
        console.warn('❌ Invalid objectives format - not an array');
        return res.status(400).json({ message: 'objectives ต้องเป็น array ของข้อความ' });
    }
    try {
        const updated = await prisma_1.default.landingContent.update({
            where: { id: 1 },
            data: {
                historyTitle,
                historyContent,
                objectiveTitle,
                objectives,
            },
        });
        console.log('✅ Landing content updated successfully');
        res.json(updated);
    }
    catch (err) {
        console.error('❌ Error in updateLandingContent:', err);
        res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }
};
exports.updateLandingContent = updateLandingContent;
