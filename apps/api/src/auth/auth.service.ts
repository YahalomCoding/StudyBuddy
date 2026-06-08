import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { OAuth2Client } from "google-auth-library";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.model";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    authProvider: string;
    profileImage: string | null;
    hasCompletedOnboarding: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService
  ) {}

  private async signUser(user: User): Promise<AuthResponse> {
    const userWithStudent = await this.userModel.findByPk(user.id, {
      include: ["student"],
    });

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        profileImage: user.profileImage,
        hasCompletedOnboarding: Boolean(userWithStudent?.student),
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
    let user = await this.userModel.findOne({ where: { email } });

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
    const user = await this.userModel.findByPk(userId, { include: ["student"] });
    if (!user) throw new UnauthorizedException("User not found");

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      profileImage: user.profileImage,
      hasCompletedOnboarding: Boolean(user.student),
    };
  }
}
