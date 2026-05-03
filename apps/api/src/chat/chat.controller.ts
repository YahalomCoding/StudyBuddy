/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Res } from "@nestjs/common";
import { type Response } from "express";
import { Readable } from "stream";
import { env } from "../env";
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
      env.OPENROUTER_MODEL as Parameters<typeof createOpenRouterText>[0],
      env.OPENROUTER_API_KEY
    );

    const stream = chat({
      adapter,
      stream: true,
      messages: body.messages as Parameters<typeof chat>[0]["messages"],
      conversationId: body.conversationId ?? body.data?.conversationId,
      tools: [await getCurrentTimeTool, showNotificationClientDef],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const sseStream = toServerSentEventsStream(stream);
    const nodeStream = Readable.fromWeb(
      sseStream as Parameters<typeof Readable.fromWeb>[0]
    );

    nodeStream.pipe(res);
  }
}
