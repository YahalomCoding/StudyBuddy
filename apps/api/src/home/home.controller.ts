import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  type CreateAssignmentPayload,
  type CreateCourseSummaryPayload,
  type CreateTaskPayload,
  type CreateUpcomingEventPayload,
  HomeService,
} from "./home.service";

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller("home")
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  private getStudentIdFromRequest(req: AuthenticatedRequest): string {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return studentId;
  }

  @Get("dashboard")
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const studentId = this.getStudentIdFromRequest(req);

    return this.homeService.getDashboard(studentId);
  }

  @Post("tasks")
  async createTask(
    @Body() body: CreateTaskPayload,
    @Req() req: AuthenticatedRequest
  ) {
    const studentId = this.getStudentIdFromRequest(req);

    return this.homeService.createTask(body, studentId);
  }

  @Post("assignments")
  async createAssignment(
    @Body() body: CreateAssignmentPayload,
    @Req() req: AuthenticatedRequest
  ) {
    const studentId = this.getStudentIdFromRequest(req);

    return this.homeService.createAssignment(body, studentId);
  }

  @Post("events")
  async createUpcomingEvent(
    @Body() body: CreateUpcomingEventPayload,
    @Req() req: AuthenticatedRequest
  ) {
    const studentId = this.getStudentIdFromRequest(req);

    return this.homeService.createUpcomingEvent(body, studentId);
  }

  @Post("courses")
  async createCourseSummaryItem(
    @Body() body: CreateCourseSummaryPayload,
    @Req() req: AuthenticatedRequest
  ) {
    const studentId = this.getStudentIdFromRequest(req);

    return this.homeService.createCourseSummaryItem(body, studentId);
  }

  @Post("seed-demo")
  async seedDemoData() {
    return this.homeService.seedDemoData();
  }
}
