import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma'; 
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

    const user = await prisma.user.findUnique({ 
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
      role: user.role.toLowerCase() as 'user' | 'admin' 
    };
    
    console.log("✅ User ID (string):", req.user.id);
    console.log("✅ User role:", req.user.role);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

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