/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Res } from "@nestjs/common";
import { Readable } from "stream";
import { type Response } from "express";
import { createLangfuseMiddleware } from "./langfuse.middleware";
import { getCurrentTimeTool } from "./tools";
import { getSystemPrompt, loadAiChat } from "./ai.utils";

const LANGFUSE_SYSTEM_PROMPT_NAME = "studybuddy-base-system";

@Controller("chat")
export class ChatController {
  constructor() {}

  @Post()
  async chat(@Body() body: any, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const { toServerSentEventsStream } = await import("@tanstack/ai");
    const { showNotificationClientDef } =
      await import("@studybuddy/tool-definitions");

    const { chat, aiTextProviderAdapter } = await loadAiChat();

    const systemPrompt = await getSystemPrompt(LANGFUSE_SYSTEM_PROMPT_NAME);
    const stream = chat({
      adapter: aiTextProviderAdapter,
      stream: true,
      messages: body.messages as Parameters<typeof chat>[0]["messages"],
      conversationId: body.conversationId ?? body.data?.conversationId,
      tools: [await getCurrentTimeTool, showNotificationClientDef],
      systemPrompts: [systemPrompt.prompt],
      // One middleware instance per request — owns its own span state
      middleware: [
        createLangfuseMiddleware({
          userId: body.userId ?? body.data?.userId,
          tags: body.tags ?? body.data?.tags,
          promptName: systemPrompt.promptName,
          promptVersion: systemPrompt.version,
        }),
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const sseStream = toServerSentEventsStream(stream);
    const nodeStream = Readable.fromWeb(
      sseStream as Parameters<typeof Readable.fromWeb>[0]
    );

    nodeStream.pipe(res);
  }
}
