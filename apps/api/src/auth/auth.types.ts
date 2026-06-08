import type { Request } from "express";

export interface JwtUser {
  sub: string;
  username: string;
  email?: string | null;
}

export interface AuthRequest extends Request {
  user: JwtUser;
}
