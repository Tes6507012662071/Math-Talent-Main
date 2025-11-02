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
exports.uploadAttendance = void 0;
const XLSX = __importStar(require("xlsx"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const uploadAttendance = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
        }
        console.log("📂 รับไฟล์:", req.file.originalname);
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const rows = sheet.map((row) => ({
            userCode: row.userCode ? String(row.userCode).trim() : undefined,
            fullname: row.fullname ? String(row.fullname).trim() : undefined,
        }));
        console.log("📄 อ่าน Excel rows:", rows);
        let updated = 0;
        let notFound = 0;
        for (const [index, row] of rows.entries()) {
            console.log(`\n🔹 Processing row ${index + 1}:`, row);
            let user = null;
            if (row.userCode) {
                console.log(`👉 กำลังค้นหา User ด้วย userCode='${row.userCode}'`);
                user = await prisma_1.default.individualRegistration.findFirst({
                    where: { userCode: row.userCode },
                });
                console.log("   ⬅️ Query userCode result:", user);
            }
            if (!user && row.fullname) {
                console.log(`👉 กำลังค้นหา User ด้วย fullname (case-insensitive)='${row.fullname}'`);
                user = await prisma_1.default.individualRegistration.findFirst({
                    where: {
                        fullname: {
                            equals: row.fullname,
                            mode: 'insensitive'
                        }
                    },
                });
                console.log("   ⬅️ Query fullname result:", user);
            }
            if (user) {
                await prisma_1.default.individualRegistration.update({
                    where: { id: user.id },
                    data: {
                        status: client_1.IndividualStatus.completed,
                    }
                });
                updated++;
                console.log(`✅ Updated User: ${user.fullname} (${user.userCode})`);
            }
            else {
                notFound++;
                console.log("❌ User not found in DB");
            }
        }
        console.log(`\n📊 Summary: Updated ${updated}, Not Found ${notFound}`);
        return res.json({
            message: "Upload สำเร็จ",
            updated,
            notFound,
        });
    }
    catch (error) {
        console.error("❌ Error in uploadAttendance:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.uploadAttendance = uploadAttendance;
