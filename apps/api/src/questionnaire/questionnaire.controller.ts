import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { questionnaireSchema } from "@studybuddy/schemas";
import { createZodDto } from "nestjs-zod";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthRequest } from "../auth/auth.types";
import { QuestionnaireService } from "./questionnaire.service";

class QuestionnaireDto extends createZodDto(questionnaireSchema) {}

@UseGuards(JwtAuthGuard)
@Controller("questionnaire")
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  async submit(@Req() req: AuthRequest, @Body() body: QuestionnaireDto) {
    return this.questionnaireService.submit(req.user.id, body);
  }
}
