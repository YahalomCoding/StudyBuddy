import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";
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

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post("google")
  google(@Body() body: GoogleDto) {
    return this.authService.googleLogin(body.idToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthRequest) {
    return this.authService.me(req.user.id);
  }
}
