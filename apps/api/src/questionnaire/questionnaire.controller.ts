import { Body, Controller, Post } from "@nestjs/common";
import { questionnaireSchema } from "@studybuddy/schemas";
import { createZodDto } from "nestjs-zod";
import { QuestionnaireService } from "./questionnaire.service";

class QuestionnaireDto extends createZodDto(questionnaireSchema) {}

@Controller("questionnaire")
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  async submit(@Body() body: QuestionnaireDto) {
    return this.questionnaireService.submit(body);
  }
}
