import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CoursesService } from "./courses.service";

@Controller("courses")
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(":studentSemesterCourseId/details")
  getCourseDetails(
    @Req() request: AuthRequest,
    @Param("studentSemesterCourseId", ParseUUIDPipe)
    studentSemesterCourseId: string,
  ) {
    return this.coursesService.getCourseDetails(
      request.user.id,
      studentSemesterCourseId,
    );
  }
}