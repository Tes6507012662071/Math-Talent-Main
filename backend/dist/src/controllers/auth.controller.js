"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getCurrentUser = exports.loginUser = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email is already in use" });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { name, email, password: hashed }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(201).json({ token });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Register failed" });
    }
};
exports.register = register;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("[Backend] Login request:", email);
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            console.log("[Backend] User not found:", email);
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log("[Backend] Password mismatch for user:", email);
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("[Backend] Login success for user:", email, "Role:", user.role);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("[Backend] Login error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
};
exports.loginUser = loginUser;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "ไม่ได้รับสิทธิ์" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                phone: true,
                department: true,
                bio: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("getCurrentUser error:", err);
        res.status(500).json({ message: "Cannot fetch user" });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "ไม่ได้รับสิทธิ์ (No User ID)" });
        }
        const { name, phone, department, bio, email } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                phone,
                department,
                bio
            }
        });
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);
    }
    catch (err) {
        console.error("updateUserProfile error:", err);
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            err.meta &&
            Array.isArray(err.meta.target) &&
            err.meta.target.includes('email')) {
            return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
        }
        res.status(500).json({ message: "Update profile failed" });
    }
};
exports.updateUserProfile = updateUserProfile;
