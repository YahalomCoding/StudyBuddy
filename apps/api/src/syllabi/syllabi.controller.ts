import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ConfirmSyllabusDto } from "./syllabus.schemas";
import { SyllabiService, type UploadedPdfFile } from "./syllabi.service";

@Controller("syllabi")
@UseGuards(JwtAuthGuard)
export class SyllabiController {
  constructor(private readonly syllabiService: SyllabiService) {}

  @Post("preview")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  preview(@Req() request: AuthRequest, @UploadedFile() file?: UploadedPdfFile) {
    if (!file) {
      throw new BadRequestException("A PDF file is required");
    }

    return this.syllabiService.preview(request.user.id, file);
  }

  @Post("confirm")
  confirm(@Req() request: AuthRequest, @Body() body: ConfirmSyllabusDto) {
    return this.syllabiService.confirm(request.user.id, body);
  }
}
