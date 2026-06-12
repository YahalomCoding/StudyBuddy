import type { Request } from "express";

export type JwtUser = {
  sub: string;
  username: string;
  email: string | null;
  studentId?: string | null;
};

export type AuthenticatedUser = {
  id: string; // User.id
  username: string;
  email: string | null;
  studentId?: string | null; // Student.id
};

export type AuthRequest = Request & {
  user: AuthenticatedUser;
};