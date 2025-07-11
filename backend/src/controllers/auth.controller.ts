// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User";

// export const register = async (req: Request, res: Response) => {
//   const { name, email, password } = req.body;

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email is already in use" });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({ name, email, password: hashed });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
//       expiresIn: "7d",
//     });

//     res.status(201).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Register failed", error: err });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
//       expiresIn: "7d",
//     });

//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err });
//   }
// };

// export const getCurrentUser = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.user?.id).select("-password");
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Cannot fetch user", error: err });
//   }
// };
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

//กำหนด CustomRequest สำหรับ req.user
interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

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
    res.status(500).json({ message: "Register failed", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
};

export const getCurrentUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Cannot fetch user", error: err });
  }
};