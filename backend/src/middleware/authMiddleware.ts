// backend/src/middleware/authMiddleware.ts (เวอร์ชัน Prisma)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import User from '../models/User'; 

// 2. ✅ Import Prisma Client เข้ามาแทน
import prisma from '../utils/prisma'; 

// 3. ✅ Import Type Role จาก Prisma เพื่อความถูกต้อง
import { Role } from '../generated/client'; 

// ขยาย interface ของ Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'user' | 'admin';
      };
    }
  }
}

// ✅ 1. protect: ตรวจสอบการล็อกอิน (ทั้ง user และ admin)
export const protect = async (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    console.log("✅ Token verified, user ID:", decoded.id);
    
    // 4. ‼️ Mongoose: .findById().select('role') -> Prisma: .findUnique() + select ‼️
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { 
        id: true, // ดึง id มาใช้ใน req.user
        role: true // ดึง role มาใช้ใน req.user
      }
    });
    
    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "ไม่พบผู้ใช้" });
    }
    
    // 5. ✅ กำหนด req.user (ใช้ user.id ตรงๆ และ role ที่มาจาก Prisma Enum)
    req.user = { 
      id: user.id, // ใช้ user.id แทน user._id
      role: user.role.toLowerCase() as 'user' | 'admin' // แปลง Enum เป็น string (lowercase) เพื่อให้เข้ากับ Global Type
    };
    
    console.log("✅ User ID (string):", req.user.id);
    console.log("✅ User role:", req.user.role);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

// ✅ 2. adminOnly: ตรวจสอบสิทธิ์ admin เท่านั้น (ไม่จำเป็นต้องแก้)
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
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