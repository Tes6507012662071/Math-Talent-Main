// middlewares/authAdmin.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User"; // ต้อง import model User มาเช็ค role

interface CustomRequest extends Request {
  user?: { id: string; role?: string };
}

// ✅ verifyToken (ของคุณเดิม)
export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

// ✅ isAdmin middleware
export const isAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};
