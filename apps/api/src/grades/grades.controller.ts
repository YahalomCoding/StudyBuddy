import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GradesService } from "./grades.service";

type UpdateCourseGradesPayload = {
  examGrade?: number | null;
  assignmentGrade?: number | null;
};

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

  @Patch(":courseId")
  @UseGuards(JwtAuthGuard)
  async updateCourseGrades(
    @Req() req: { user?: { studentId?: string } },
    @Param("courseId") courseId: string,
    @Body() body: UpdateCourseGradesPayload
  ) {
    const studentId = req.user?.studentId;

    if (!studentId) {
      return [];
    }

    return this.gradesService.updateStudentCourseGrades(
      studentId,
      courseId,
      body
    );
  }
}
