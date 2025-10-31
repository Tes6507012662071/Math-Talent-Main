import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from '../utils/prisma'; 
import { Prisma } from '../generated/client'; 

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
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
    const user = await prisma.user.findUnique({ where: { email } });
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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
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
  } catch (error) {
    console.error("[Backend] Login error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ไม่ได้รับสิทธิ์" });
    }
    const user = await prisma.user.findUnique({
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
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Cannot fetch user" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ไม่ได้รับสิทธิ์ (No User ID)" });
    }

    const { name, phone, department, bio, email } = req.body;

    const updatedUser = await prisma.user.update({
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

  } catch (err: any) {
     console.error("updateUserProfile error:", err);
     
     if (
        err instanceof Prisma.PrismaClientKnownRequestError && 
        err.code === 'P2002' && 
        err.meta && 
        Array.isArray(err.meta.target) && 
        err.meta.target.includes('email') 
     ) {
         return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
     }
  
    res.status(500).json({ message: "Update profile failed" });
  }
};