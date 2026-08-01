import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GradesService } from "./grades.service";

@Controller("grades")
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getGrades(@Req() req: { user?: { studentId?: string } }) {
    const studentId = req.user?.studentId;

    if (!studentId) {
      return [];
    }

    return this.gradesService.getStudentGrades(studentId);
  }
}
