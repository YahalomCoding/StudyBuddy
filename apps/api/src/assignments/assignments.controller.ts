import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  AssignmentsService,
  type UpdateAssignmentPayload,
} from "./assignments.service";

type UploadedIcsFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post("import-ics")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  importAssignmentsFromIcs(
    @Req() req: any,
    @UploadedFile() file: UploadedIcsFile
  ) {
    if (!file) {
      throw new BadRequestException("ICS file is required");
    }

    return this.assignmentsService.importAssignmentsFromIcs(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.id,
      file.buffer
    );
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateAssignment(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: UpdateAssignmentPayload
  ) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return this.assignmentsService.updateAssignment(id, body, studentId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  deleteAssignment(@Req() req: AuthRequest, @Param("id") id: string) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return this.assignmentsService.deleteAssignment(id, studentId);
  }
}
