// backend/src/controllers/auth.controller.ts (เวอร์ชัน Prisma)
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import User from "../models/User";

// 2. ✅ Import Prisma Client เข้ามาแทน
import prisma from '../utils/prisma'; 

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // 3. ‼️ Mongoose: .findOne({ email }) -> Prisma: .findUnique({ where: { email } }) ‼️
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // 4. ‼️ Mongoose: .create() -> Prisma: .user.create() ‼️
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { // 5. ✅ user._id -> user.id
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Register failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("[Backend] Login request:", email);

  try {
    // 6. ‼️ Mongoose: .findOne({ email }) -> Prisma: .findUnique({ where: { email } }) ‼️
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log("[Backend] User not found:", email);
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // Logic เปรียบเทียบรหัสผ่าน (เหมือนเดิม)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[Backend] Password mismatch for user:", email);
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, // 7. ✅ user._id -> user.id
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("[Backend] Login success for user:", email, "Role:", user.role);

    res.json({
      token,
      user: {
        id: user.id, // 8. ✅ _id -> id
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Backend] Login error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 9. ✅ req.user.id มาจาก authMiddleware (ซึ่งถูกแก้แล้ว)
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ไม่ได้รับสิทธิ์" });
    }

    // 10. ‼️ Mongoose: .findById().select('-password') -> Prisma: .findUnique() + select ‼️
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // ✅ ไม่เอา password
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Cannot fetch user" });
  }
};