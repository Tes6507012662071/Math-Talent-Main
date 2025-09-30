import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// ✅ ลบ CustomRequest ออกทั้งหมด — ใช้ global type จาก src/types/express/index.d.ts

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
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
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Backend] User not found:", email);
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[Backend] Password mismatch for user:", email);
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("[Backend] Login success for user:", email, "Role:", user.role);

    res.json({
      token,
      user: {
        _id: user._id,
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
    // ✅ ตรวจสอบ req.user จาก global type
    if (!req.user) {
      return res.status(401).json({ message: "ไม่ได้รับสิทธิ์" });
    }

    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Cannot fetch user" });
  }
};