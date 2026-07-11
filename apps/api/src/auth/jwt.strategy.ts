import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthenticatedUser, JwtUser } from "./auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      secretOrKey: process.env.JWT_SECRET ?? "dev-secret-change-me",
    });
  }

  validate(payload: JwtUser): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      studentId: payload.studentId,
    };
  }
}
