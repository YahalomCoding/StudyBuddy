/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { type Response } from "express";
import { Readable } from "stream";
import type { AuthRequest } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AiFeaturesService } from "./ai-features.service";
import {
  getSystemPrompt,
  LANGFUSE_PROMPT_NAMES,
  loadAiChat,
} from "./ai.utils";
import { createLangfuseMiddleware } from "./langfuse.middleware";
import { ToolsService } from "./tools.service";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiFeaturesService: AiFeaturesService,
    private readonly toolsService: ToolsService
  ) {}

  private getRequestIdentity(req: AuthRequest): {
    userId: string;
    studentId: string;
  } {
    const userId = req.user.id;
    const studentId = req.user.studentId;

    if (!userId) {
      throw new UnauthorizedException("User identity is missing");
    }

    if (!studentId) {
      throw new UnauthorizedException("Student profile was not created yet");
    }

    return { userId, studentId };
  }

  private async pipeSseResponse(res: Response, stream: unknown) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const { toServerSentEventsStream } = await import("@tanstack/ai");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const sseStream = toServerSentEventsStream(stream as never);
    const nodeStream = Readable.fromWeb(
      sseStream as Parameters<typeof Readable.fromWeb>[0]
    );

    nodeStream.pipe(res);
  }

  @Post("chat")
  async chat(@Body() body: any, @Req() req: AuthRequest, @Res() res: Response) {
    const { userId, studentId } = this.getRequestIdentity(req);
    const { showNotificationClientDef } =
      await import("@studybuddy/tool-definitions");

    const { chat, aiTextProviderAdapter } = await loadAiChat();

    const systemPrompt = await getSystemPrompt(LANGFUSE_PROMPT_NAMES.baseChat);
    const stream = chat({
      adapter: aiTextProviderAdapter,
      stream: true,
      messages: body.messages,
      conversationId: body.conversationId ?? body.data?.conversationId,
      tools: [
        ...this.toolsService.getChatTools({ userId, studentId }),
        showNotificationClientDef,
      ],
      systemPrompts: [systemPrompt.prompt],
      // One middleware instance per request — owns its own span state
      middleware: [
        createLangfuseMiddleware({
          userId,
          tags: body.tags ?? body.data?.tags,
          promptName: systemPrompt.promptName,
          promptVersion: systemPrompt.version,
        }),
      ],
    });

    await this.pipeSseResponse(res, stream);
  }

  @Post("study-plan")
  async streamStudyPlan(@Req() req: AuthRequest, @Res() res: Response) {
    const { userId, studentId } = this.getRequestIdentity(req);
    const stream = await this.aiFeaturesService.streamStudyPlan(
      studentId,
      userId
    );

    await this.pipeSseResponse(res, stream);
  }

  @Post("deadline-insights")
  async streamDeadlineInsights(@Req() req: AuthRequest, @Res() res: Response) {
    const { userId, studentId } = this.getRequestIdentity(req);
    const stream = await this.aiFeaturesService.streamDeadlineInsights(
      studentId,
      userId
    );

    await this.pipeSseResponse(res, stream);
  }

  @Post("generate-assignments")
  async generateAssignments(@Req() req: AuthRequest) {
    const { userId, studentId } = this.getRequestIdentity(req);

    return this.aiFeaturesService.generateAssignmentsAndSubtasks(
      studentId,
      userId
    );
  }
}
