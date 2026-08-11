import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
    studentSemesterCourseId: string
  ) {
    return this.coursesService.getCourseDetails(
      request.user.id,
      studentSemesterCourseId
    );
  }

  @Patch(":studentSemesterCourseId/details")
  updateCourseDetails(
    @Req() request: AuthRequest,
    @Param("studentSemesterCourseId", ParseUUIDPipe)
    studentSemesterCourseId: string,
    @Body() body: { title?: string; credits?: number; semesterNumber?: number }
  ) {
    return this.coursesService.updateCourseBasicInfo(
      request.user.id,
      studentSemesterCourseId,
      body
    );
  }
}
