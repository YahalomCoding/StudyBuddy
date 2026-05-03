import { Controller, Get, Post, Query } from "@nestjs/common";
import { HomeService } from "./home.service";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get("dashboard")
  async getDashboard(@Query("studentId") studentId?: string) {
    return this.homeService.getDashboard(studentId);
  }

  @Post("seed-demo")
  async seedDemoData() {
    return this.homeService.seedDemoData();
  }
}
