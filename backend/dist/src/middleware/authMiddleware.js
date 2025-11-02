"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const protect = async (req, res, next) => {
    console.log("=== Auth Middleware Debug ===");
    const authHeader = req.header("Authorization");
    console.log("Authorization header:", authHeader);
    const token = authHeader?.replace("Bearer ", "");
    console.log("Token extracted:", token ? "Present" : "Missing");
    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified, user ID:", decoded.id);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                role: true
            }
        });
        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(401).json({ message: "ไม่พบผู้ใช้" });
        }
        req.user = {
            id: user.id,
            role: user.role.toLowerCase()
        };
        console.log("✅ User ID (string):", req.user.id);
        console.log("✅ User role:", req.user.role);
        next();
    }
    catch (err) {
        console.error("❌ Token verification failed:", err);
        return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    console.log("=== AdminOnly Middleware Debug ===");
    console.log("User from protect:", req.user);
    if (!req.user) {
        console.log("❌ No user in request (protect middleware not run?)");
        return res.status(401).json({ message: "ไม่ได้รับสิทธิ์" });
    }
    if (req.user.role !== 'admin') {
        console.log(`❌ Access denied for role: ${req.user.role}`);
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
    console.log("✅ Admin access granted");
    next();
};
exports.adminOnly = adminOnly;
