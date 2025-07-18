import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


// Define the interface for the custom request
interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
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
    
    // Fix: Set req.user instead of req.userId
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

export default authMiddleware;