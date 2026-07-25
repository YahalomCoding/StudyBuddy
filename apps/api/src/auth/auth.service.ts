/* eslint-disable turbo/no-undeclared-env-vars */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { OAuth2Client } from "google-auth-library";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.model";
import { AUTH_COOKIE_NAME } from "./auth.constants";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    authProvider: string;
    profileImage: string | null;
    hasCompletedOnboarding: boolean;
    studentId: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService
  ) {}

  setAuthCookie(res: Response, accessToken: string) {
    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookie(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  async signUser(user: User): Promise<AuthResponse> {
    const userWithStudent = await this.userModel.findByPk(user.id, {
      include: ["student"],
    });

    const studentId = userWithStudent?.student?.id ?? null;

    const payload = {
      sub: user.id, // User.id
      username: user.username,
      email: user.email,
      studentId, // Student.id
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        profileImage: user.profileImage,
        hasCompletedOnboarding: Boolean(studentId),
        studentId,
      },
    };
  }

  async register(username: string, email: string, password: string) {
    const existingUser = await this.userModel.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      username,
      email: email.toLowerCase(),
      password: passwordHash,
      authProvider: "local",
    });

    return this.signUser(user);
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.signUser(user);
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException("Invalid Google token");
    }

    const email = payload.email.toLowerCase();

    let user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userModel.create({
        username: payload.name || email.split("@")[0],
        email,
        password: null,
        authProvider: "google",
        providerId: payload.sub,
        profileImage: payload.picture ?? null,
      });
    }

    if (!user.providerId) {
      await user.update({
        authProvider: "google",
        providerId: payload.sub,
        profileImage: user.profileImage ?? payload.picture ?? null,
      });
    }

    return this.signUser(user);
  }

  async me(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: ["student"],
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const studentId = user.student?.id ?? null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      profileImage: user.profileImage,
      hasCompletedOnboarding: Boolean(studentId),
      studentId,
    };
  }
}
