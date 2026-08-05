import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  GeneralTasksService,
  type UpdateGeneralTaskPayload,
} from "./general-tasks.service";

@Controller("general-tasks")
export class GeneralTasksController {
  constructor(private readonly generalTasksService: GeneralTasksService) {}

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: UpdateGeneralTaskPayload
  ) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return this.generalTasksService.updateTask(id, body, studentId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Req() req: AuthRequest, @Param("id") id: string) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return this.generalTasksService.deleteTask(id, studentId);
  }
}
