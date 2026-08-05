import {
  ROOT_CONTEXT,
  SpanKind,
  SpanStatusCode,
  trace,
  type Context,
} from "@opentelemetry/api";
import { LangfuseOtelSpanAttributes } from "@langfuse/core";
import { langfuseSpanProcessor, SERVICE_NAME } from "../instrumentation";

const tracer = trace.getTracer(SERVICE_NAME);

const genAi = {
  SYSTEM: "gen_ai.system",
  OPERATION_NAME: "gen_ai.operation.name",
  REQUEST_MODEL: "gen_ai.request.model",
  USAGE_INPUT_TOKENS: "gen_ai.usage.input_tokens",
  USAGE_OUTPUT_TOKENS: "gen_ai.usage.output_tokens",
  FINISH_REASONS: "gen_ai.response.finish_reasons",
  DURATION: "gen_ai.client.operation.duration",
} as const;

const safeJson = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export type LangfuseGenerationUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
};

export type LangfuseGenerationOptions = {
  name: string;
  model: string;
  provider: string;
  input: unknown;
  modelParameters?: Record<string, unknown>;
  promptName?: string;
  promptVersion?: number;
  metadata?: Record<string, unknown>;
};

export type LangfuseTraceOptions = {
  name: string;
  userId?: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

export type LangfuseGenerationHandle = {
  success: (options: {
    output: unknown;
    durationMs: number;
    finishReason?: string | null;
    usage?: LangfuseGenerationUsage;
    metadata?: Record<string, unknown>;
  }) => void;
  error: (error: unknown, metadata?: Record<string, unknown>) => void;
};

export type LangfuseTraceHandle = {
  startGeneration: (
    options: LangfuseGenerationOptions
  ) => LangfuseGenerationHandle;
  success: (
    output: unknown,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  warning: (
    output: unknown,
    statusMessage: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  error: (error: unknown, metadata?: Record<string, unknown>) => Promise<void>;
};

/**
 * Manual Langfuse trace helper for LLM calls that do not use @tanstack/ai.
 * It reuses the OpenTelemetry SDK and LangfuseSpanProcessor initialized in
 * instrumentation.ts, matching the existing chat middleware setup.
 */
export const startLangfuseTrace = (
  options: LangfuseTraceOptions
): LangfuseTraceHandle => {
  const rootSpan = tracer.startSpan(
    options.name,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        [LangfuseOtelSpanAttributes.OBSERVATION_TYPE]: "span",
        [LangfuseOtelSpanAttributes.TRACE_NAME]: options.name,
        ...(options.input !== undefined
          ? {
              [LangfuseOtelSpanAttributes.TRACE_INPUT]: safeJson(options.input),
              [LangfuseOtelSpanAttributes.OBSERVATION_INPUT]: safeJson(
                options.input
              ),
            }
          : {}),
        ...(options.metadata
          ? {
              [LangfuseOtelSpanAttributes.TRACE_METADATA]: safeJson(
                options.metadata
              ),
            }
          : {}),
        ...(options.userId
          ? {
              [LangfuseOtelSpanAttributes.TRACE_USER_ID]: options.userId,
              [LangfuseOtelSpanAttributes.TRACE_COMPAT_USER_ID]: options.userId,
            }
          : {}),
        ...(options.tags
          ? {
              [LangfuseOtelSpanAttributes.TRACE_TAGS]: options.tags,
            }
          : {}),
      },
    },
    ROOT_CONTEXT
  );

  const rootContext: Context = trace.setSpan(ROOT_CONTEXT, rootSpan);
  const initialMetadata = options.metadata ?? {};
  let ended = false;

  const flushSafely = async () => {
    try {
      await langfuseSpanProcessor.forceFlush();
    } catch {
      // Observability must never break syllabus import.
    }
  };

  const endRoot = async (
    output: unknown,
    options?: {
      level?: "WARNING" | "ERROR";
      statusMessage?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    if (ended) return;
    ended = true;

    rootSpan.setAttributes({
      [LangfuseOtelSpanAttributes.TRACE_OUTPUT]: safeJson(output),
      [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson(output),
      ...(options?.metadata
        ? {
            [LangfuseOtelSpanAttributes.TRACE_METADATA]: safeJson({
              ...initialMetadata,
              ...(options.metadata ?? {}),
            }),
          }
        : {}),
      ...(options?.level
        ? {
            [LangfuseOtelSpanAttributes.OBSERVATION_LEVEL]: options.level,
          }
        : {}),
      ...(options?.statusMessage
        ? {
            [LangfuseOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]:
              options.statusMessage,
          }
        : {}),
    });

    if (options?.level === "ERROR") {
      rootSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: options.statusMessage,
      });
    }

    rootSpan.end();
    await flushSafely();
  };

  return {
    startGeneration(generationOptions) {
      const generationSpan = tracer.startSpan(
        generationOptions.name,
        {
          kind: SpanKind.CLIENT,
          attributes: {
            [LangfuseOtelSpanAttributes.OBSERVATION_TYPE]: "generation",
            [LangfuseOtelSpanAttributes.OBSERVATION_MODEL]:
              generationOptions.model,
            [LangfuseOtelSpanAttributes.OBSERVATION_INPUT]: safeJson(
              generationOptions.input
            ),
            ...(generationOptions.modelParameters
              ? {
                  [LangfuseOtelSpanAttributes.OBSERVATION_MODEL_PARAMETERS]:
                    safeJson(generationOptions.modelParameters),
                }
              : {}),
            ...(generationOptions.promptName
              ? {
                  [LangfuseOtelSpanAttributes.OBSERVATION_PROMPT_NAME]:
                    generationOptions.promptName,
                  ...(generationOptions.promptVersion !== undefined
                    ? {
                        [LangfuseOtelSpanAttributes.OBSERVATION_PROMPT_VERSION]:
                          generationOptions.promptVersion,
                      }
                    : {}),
                }
              : {}),
            [genAi.SYSTEM]: generationOptions.provider,
            [genAi.OPERATION_NAME]: "chat",
            [genAi.REQUEST_MODEL]: generationOptions.model,
          },
        },
        rootContext
      );

      let generationEnded = false;

      return {
        success(successOptions) {
          if (generationEnded) return;
          generationEnded = true;

          const inputTokens = successOptions.usage?.inputTokens ?? 0;
          const outputTokens = successOptions.usage?.outputTokens ?? 0;
          const totalTokens =
            successOptions.usage?.totalTokens ?? inputTokens + outputTokens;

          generationSpan.setAttributes({
            [genAi.USAGE_INPUT_TOKENS]: inputTokens,
            [genAi.USAGE_OUTPUT_TOKENS]: outputTokens,
            [genAi.DURATION]: successOptions.durationMs / 1_000,
            ...(successOptions.finishReason
              ? {
                  [genAi.FINISH_REASONS]: [successOptions.finishReason],
                }
              : {}),
            [LangfuseOtelSpanAttributes.OBSERVATION_USAGE_DETAILS]: safeJson({
              input: inputTokens,
              output: outputTokens,
              total: totalTokens,
            }),
            [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson(
              successOptions.output
            ),
          });
          generationSpan.end();
        },

        error(error, _metadata) {
          if (generationEnded) return;
          generationEnded = true;

          const message =
            error instanceof Error ? error.message : String(error);
          generationSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          });
          generationSpan.setAttributes({
            [LangfuseOtelSpanAttributes.OBSERVATION_LEVEL]: "ERROR",
            [LangfuseOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]: message,
            [LangfuseOtelSpanAttributes.OBSERVATION_OUTPUT]: safeJson({
              error: message,
            }),
          });
          generationSpan.end();
        },
      };
    },

    success(output, metadata) {
      return endRoot(output, { metadata });
    },

    warning(output, statusMessage, metadata) {
      return endRoot(output, {
        level: "WARNING",
        statusMessage,
        metadata,
      });
    },

    error(error, metadata) {
      const message = error instanceof Error ? error.message : String(error);
      return endRoot(
        { error: message },
        {
          level: "ERROR",
          statusMessage: message,
          metadata,
        }
      );
    },
  };
};
