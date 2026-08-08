import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ExamsService } from "./exams.service";

@Controller("exams")
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Patch(":id")
  updateExam(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
    @Body() body: { date?: string; type?: number }
  ) {
    return this.examsService.updateExam(id, req.user.id, body);
  }
}
