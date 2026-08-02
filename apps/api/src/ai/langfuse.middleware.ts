import {
  ROOT_CONTEXT,
  SpanKind,
  SpanStatusCode,
  trace,
  type Span,
} from "@opentelemetry/api";
import { LangfuseOtelSpanAttributes } from "@langfuse/core";
import { langfuseSpanProcessor, SERVICE_NAME } from "../instrumentation";
import type { ChatMiddleware } from "@tanstack/ai" with {
  "resolution-mode": "import",
};

const TRACER_NAME = SERVICE_NAME;

/** Semantic conventions for GenAI spans (OpenTelemetry GenAI). */
const genAi = {
  SYSTEM: "gen_ai.system",
  OPERATION_NAME: "gen_ai.operation.name",
  REQUEST_MODEL: "gen_ai.request.model",
  USAGE_INPUT_TOKENS: "gen_ai.usage.input_tokens",
  USAGE_OUTPUT_TOKENS: "gen_ai.usage.output_tokens",
  FINISH_REASONS: "gen_ai.response.finish_reasons",
  DURATION: "gen_ai.client.operation.duration",
  TOOL_NAME: "gen_ai.tool.name",
  TOOL_CALL_ID: "gen_ai.tool.call.id",
  TOOL_TYPE: "gen_ai.tool.type",
} as const;

export interface LangfuseMiddlewareOptions {
  /** User ID attached to the Langfuse trace (e.g. from auth). */
  userId?: string;
  /** Tags attached to the Langfuse trace. */
  tags?: string[];
  /** Langfuse prompt name to link to this generation. */
  promptName?: string;
  /** Langfuse prompt version to link. */
  promptVersion?: number;
  /** System prompts to include in the trace (captured as metadata). */
  systemPrompts?: string[];
}

/**
 * Creates a per-request ChatMiddleware that traces the full chat lifecycle
 * into Langfuse via the OpenTelemetry LangfuseSpanProcessor registered in
 * instrumentation.ts.
 * This custom function exists since there is no native Langfuse instrumentation for the @tanstack/ai framework
 *
 * Span hierarchy produced in Langfuse:
 *   chat-response  (generation, covers full agentic loop)
 *   └── tool: <name>  (one child span per tool execution)
 */
export function createLangfuseMiddleware(
  options?: LangfuseMiddlewareOptions
): ChatMiddleware {
  const tracer = trace.getTracer(TRACER_NAME);
  let rootSpan: Span | undefined;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let traceInput: string | undefined;

  const safeJson = (value: unknown): string => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  return {
    name: "langfuse",

    onConfig(ctx, config) {
      if (ctx.phase !== "init") return;

      const lastMessage = config.messages[config.messages.length - 1];
      if (!lastMessage) return;

      // Keep trace input focused on the latest user turn instead of full history.
      traceInput = safeJson(lastMessage.content);
    },

    onStart(ctx) {
      // Start the root span in ROOT_CONTEXT so it is always the trace root,
      // regardless of any ambient OTel context from framework instrumentation.
      rootSpan = tracer.startSpan(
        "chat-response",
        {
          kind: SpanKind.CLIENT,
          attributes: {
            // --- Langfuse observation attributes ---
            [LangfuseOtelSpanAttributes.OBSERVATION_TYPE]: "generation",
            [LangfuseOtelSpanAttributes.OBSERVATION_MODEL]: ctx.model,
            ...(ctx.options
              ? {
                  [LangfuseOtelSpanAttributes.OBSERVATION_MODEL_PARAMETERS]:
                    safeJson(ctx.options),
                }
              : {}),
            ...(traceInput
              ? {
                  [LangfuseOtelSpanAttributes.OBSERVATION_INPUT]: traceInput,
                }
              : {}),

            // --- Langfuse trace attributes ---
            [LangfuseOtelSpanAttributes.TRACE_NAME]: "chat-response",
            ...(traceInput
              ? { [LangfuseOtelSpanAttributes.TRACE_INPUT]: traceInput }
              : {}),
            [LangfuseOtelSpanAttributes.TRACE_METADATA]: safeJson({
              requestId: ctx.requestId,
              streamId: ctx.streamId,
              provider: ctx.provider,
              model: ctx.model,
              source: ctx.source,
              streaming: ctx.streaming,
              ...(options?.systemPrompts?.length
                ? { systemPrompts: options.systemPrompts }
                : {}),
            }),
            ...(ctx.conversationId
              ? {
                  [LangfuseOtelSpanAttributes.TRACE_SESSION_ID]:
                    ctx.conversationId,
                  [LangfuseOtelSpanAttributes.TRACE_COMPAT_SESSION_ID]:
                    ctx.conversationId,
                }
              : {}),
            ...(options?.userId
              ? {
                  [LangfuseOtelSpanAttributes.TRACE_USER_ID]: options.userId,
                  [LangfuseOtelSpanAttributes.TRACE_COMPAT_USER_ID]:
                    options.userId,
                }
              : {}),
            ...(options?.tags
              ? {
                  [LangfuseOtelSpanAttributes.TRACE_TAGS]: options.tags,
                }
              : {}),
            ...(options?.promptName
              ? {
                  [LangfuseOtelSpanAttributes.OBSERVATION_PROMPT_NAME]:
                    options.promptName,
                  ...(options.promptVersion !== undefined
                    ? {
                        [LangfuseOtelSpanAttributes.OBSERVATION_PROMPT_VERSION]:
                          options.promptVersion,
                      }
                    : {}),
                }
              : {}),

            // --- OpenTelemetry GenAI semantic conventions ---
            [genAi.SYSTEM]: ctx.provider,
            [genAi.OPERATION_NAME]: "chat",
            [genAi.REQUEST_MODEL]: ctx.model,
          },
        },
        ROOT_CONTEXT
      );
    },

    onUsage(_ctx, usage) {
      // Accumulate tokens across agent-loop iterations
      totalInputTokens += usage.promptTokens;
      totalOutputTokens += usage.completionTokens;
    },

    onAfterToolCall(_ctx, info) {
      if (!rootSpan) return;
      // Create a child span for every tool call so tool latency is visible.
      // Force chat root as direct parent to guarantee parent-child linkage.
      const parentCtx = trace.setSpan(ROOT_CONTEXT, rootSpan);
      const toolSpan = tracer.startSpan(
        `tool: ${info.toolName}`,
        {
          kind: SpanKind.INTERNAL,
          attributes: {
            [LangfuseOtelSpanAttributes.OBSERVATION_TYPE]: "tool",
            [LangfuseOtelSpanAttributes.OBSERVATION_INPUT]: safeJson(
              info.toolCall.function.arguments
            ),
            [genAi.TOOL_NAME]: info.toolName,
            [genAi.TOOL_CALL_ID]: info.toolCallId,
            [genAi.TOOL_TYPE]: "function",
          },
        },
        parentCtx
      );
      if (!info.ok) {
        toolSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: String(info.error),
        });
        toolSpan.setAttributes({
          [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson({
            error: String(info.error),
          }),
          [LangfuseOtelSpanAttributes.OBSERVATION_LEVEL]: "ERROR",
          [LangfuseOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]: String(
            info.error
          ),
        });
      } else {
        toolSpan.setAttribute(
          LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT,
          safeJson(info.result)
        );
      }
      toolSpan.end();
    },

    onFinish(ctx, info) {
      if (!rootSpan) return;

      // Prefer accumulated usage; fall back to FinishInfo.usage if available.
      const inputTokens = totalInputTokens || info.usage?.promptTokens || 0;
      const outputTokens =
        totalOutputTokens || info.usage?.completionTokens || 0;

      rootSpan.setAttributes({
        // --- GenAI usage ---
        [genAi.USAGE_INPUT_TOKENS]: inputTokens,
        [genAi.USAGE_OUTPUT_TOKENS]: outputTokens,
        [genAi.DURATION]: info.duration / 1000,
        ...(info.finishReason
          ? { [genAi.FINISH_REASONS]: [info.finishReason] }
          : {}),

        // --- Langfuse-native usage (JSON object) ---
        [LangfuseOtelSpanAttributes.OBSERVATION_USAGE_DETAILS]: safeJson({
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        }),

        // --- Langfuse output ---
        [LangfuseOtelSpanAttributes.TRACE_OUTPUT]: info.content,
        [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: info.content,
      });
      rootSpan.end();
      ctx.defer(langfuseSpanProcessor.forceFlush());
    },

    onError(ctx, info) {
      if (!rootSpan) return;
      rootSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: String(info.error),
      });
      rootSpan.setAttributes({
        [LangfuseOtelSpanAttributes.OBSERVATION_LEVEL]: "ERROR",
        [LangfuseOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]: String(
          info.error
        ),
        [LangfuseOtelSpanAttributes.TRACE_OUTPUT]: safeJson({
          error: String(info.error),
        }),
        [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson({
          error: String(info.error),
        }),
      });
      rootSpan.end();
      ctx.defer(langfuseSpanProcessor.forceFlush());
    },

    onAbort(ctx, info) {
      if (!rootSpan) return;
      rootSpan.setAttributes({
        [LangfuseOtelSpanAttributes.OBSERVATION_LEVEL]: "WARNING",
        [LangfuseOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]:
          info.reason ?? "aborted",
        [LangfuseOtelSpanAttributes.TRACE_OUTPUT]: safeJson({
          aborted: true,
          reason: info.reason ?? "aborted",
        }),
        [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson({
          aborted: true,
          reason: info.reason ?? "aborted",
        }),
      });
      rootSpan.end();
      ctx.defer(langfuseSpanProcessor.forceFlush());
    },
  };
}
