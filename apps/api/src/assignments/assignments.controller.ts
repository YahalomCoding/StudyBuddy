import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
  async importAssignmentsFromIcs(
    @Req() req: any,
    @UploadedFile() file: UploadedIcsFile
  ) {
    if (!file) {
      throw new BadRequestException("ICS file is required");
    }

    return this.assignmentsService.importAssignmentsFromIcs(
      req.user.id,
      file.buffer
    );
  }

  @Patch(":id")
  async updateAssignment(
    @Param("id") id: string,
    @Body() body: UpdateAssignmentPayload
  ) {
    return this.assignmentsService.updateAssignment(id, body);
  }

  @Delete(":id")
  async deleteAssignment(@Param("id") id: string) {
    return this.assignmentsService.deleteAssignment(id);
  }
}