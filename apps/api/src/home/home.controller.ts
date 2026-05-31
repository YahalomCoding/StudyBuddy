import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  type CreateAssignmentPayload,
  type CreateCourseSummaryPayload,
  type CreateTaskPayload,
  type CreateUpcomingEventPayload,
  HomeService,
} from "./home.service";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get("dashboard")
  async getDashboard(@Query("studentId") studentId?: string) {
    return this.homeService.getDashboard(studentId);
  }

  @Post("tasks")
  async createTask(
    @Body() body: CreateTaskPayload,
    @Query("studentId") studentId?: string
  ) {
    return this.homeService.createTask(body, studentId);
  }

  @Post("assignments")
  async createAssignment(
    @Body() body: CreateAssignmentPayload,
    @Query("studentId") studentId?: string
  ) {
    return this.homeService.createAssignment(body, studentId);
  }

  @Post("events")
  async createUpcomingEvent(
    @Body() body: CreateUpcomingEventPayload,
    @Query("studentId") studentId?: string
  ) {
    return this.homeService.createUpcomingEvent(body, studentId);
  }

  @Post("courses")
  async createCourseSummaryItem(
    @Body() body: CreateCourseSummaryPayload,
    @Query("studentId") studentId?: string
  ) {
    return this.homeService.createCourseSummaryItem(body, studentId);
  }

  @Post("seed-demo")
  async seedDemoData() {
    return this.homeService.seedDemoData();
  }
}
