import { Body, Controller, Post, Res } from "@nestjs/common";
import { env } from "../env";
import { Readable } from "stream";
import { type Response } from "express";
import { getCurrentTimeTool } from "./tools";

@Controller("chat")
export class ChatController {
  constructor() {}

  @Post()
  async chat(@Body() body: any, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const { chat, toServerSentEventsStream } = await import("@tanstack/ai");
    const { createOpenRouterText } = await import("@tanstack/ai-openrouter");
    const { showNotificationClientDef } =
      await import("@studybuddy/tool-definitions");

    const adapter = createOpenRouterText(
      env.OPENROUTER_MODEL,
      env.OPENROUTER_API_KEY
    );

    const stream = chat({
      adapter,
      stream: true,
      messages: body.messages as Parameters<typeof chat>[0]["messages"],
      conversationId: body.conversationId ?? body.data?.conversationId,
      tools: [await getCurrentTimeTool, showNotificationClientDef],
    });

    const sseStream = toServerSentEventsStream(stream);
    const nodeStream = Readable.fromWeb(
      sseStream as Parameters<typeof Readable.fromWeb>[0]
    );

    nodeStream.pipe(res);
  }
}
