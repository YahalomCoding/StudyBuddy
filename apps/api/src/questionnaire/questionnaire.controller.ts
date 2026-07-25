import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { questionnaireSchema } from "@studybuddy/schemas";
import { createZodDto } from "nestjs-zod";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthRequest } from "../auth/auth.types";
import { User } from "../users/user.model";
import { QuestionnaireService } from "./questionnaire.service";

class QuestionnaireDto extends createZodDto(questionnaireSchema) {}

@UseGuards(JwtAuthGuard)
@Controller("questionnaire")
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireService,
    private readonly authService: AuthService,
    @InjectModel(User) private readonly userModel: typeof User
  ) {}

  @Post()
  async submit(@Req() req: AuthRequest, @Body() body: QuestionnaireDto) {
    await this.questionnaireService.submit(req.user.id, body);

    const userWithStudent = await this.userModel.findByPk(req.user.id, {
      include: ["student"],
    });

    if (!userWithStudent) {
      throw new NotFoundException("User not found after onboarding");
    }

    return this.authService.signUser(userWithStudent);
  }
}
