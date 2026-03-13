import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "auction-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  username?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; username: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.username = decoded.username;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; username: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.username = decoded.username;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

export { JWT_SECRET };
