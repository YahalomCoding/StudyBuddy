import { Body, Controller, Post, Res } from "@nestjs/common";
import { Readable } from "stream";
import { type Response } from "express";
import { getCurrentTimeTool } from "./tools";
import { loadAiChat } from "./ai.utils";

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

    const stream = chat({
      adapter: aiTextProviderAdapter,
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
