import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { AuthRequest } from "./auth.types";

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(1),
});

class RegisterDto extends createZodDto(registerSchema) {}
class LoginDto extends createZodDto(loginSchema) {}
class GoogleDto extends createZodDto(googleSchema) {}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private async setAuthCookieAndReturnUser(
    res: Response,
    authAction: Promise<Awaited<ReturnType<AuthService["signUser"]>>>
  ) {
    const session = await authAction;
    this.authService.setAuthCookie(res, session.accessToken);
    return {
      user: session.user,
    };
  }

  @Post("register")
  register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.setAuthCookieAndReturnUser(
      res,
      this.authService.register(body.username, body.email, body.password)
    );
  }

  @Post("login")
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.setAuthCookieAndReturnUser(
      res,
      this.authService.login(body.email, body.password)
    );
  }

  @Post("google")
  google(@Body() body: GoogleDto, @Res({ passthrough: true }) res: Response) {
    return this.setAuthCookieAndReturnUser(
      res,
      this.authService.googleLogin(body.idToken)
    );
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookie(res);
    return { success: true };
  }

  @Get("userinfo")
  @UseGuards(JwtAuthGuard)
  async userinfo(@Req() req: AuthRequest) {
    const user = await this.authService.me(req.user.id);
    return { user };
  }
}
