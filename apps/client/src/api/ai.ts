import baseApi from "./baseApi";
import { fetchServerSentEvents, StreamProcessor } from "@tanstack/ai-client";

type StreamCallbacks = {
  onReasoningDelta?: (delta: string) => void;
};

const streamSse = async (
  endpoint: string,
  onDelta: (delta: string) => void,
  callbacks?: StreamCallbacks
): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

  const connection = fetchServerSentEvents(
    `${import.meta.env.VITE_API_URL}${endpoint}`,
    {
      credentials: "include",
      body: {},
    }
  );

  let lastTextMessageId = "";
  let lastTextContent = "";
  let lastThinkingMessageId = "";
  let lastThinkingContent = "";

  const processor = new StreamProcessor({
    events: {
      onTextUpdate: (messageId, content) => {
        if (messageId !== lastTextMessageId) {
          lastTextMessageId = messageId;
          lastTextContent = "";
        }

        const delta = content.slice(lastTextContent.length);
        if (delta.length > 0) {
          onDelta(delta);
        }
        lastTextContent = content;
      },
      onThinkingUpdate: (messageId, content) => {
        if (messageId !== lastThinkingMessageId) {
          lastThinkingMessageId = messageId;
          lastThinkingContent = "";
        }

        const delta = content.slice(lastThinkingContent.length);
        if (delta.length > 0) {
          callbacks?.onReasoningDelta?.(delta);
        }
        lastThinkingContent = content;
      },
    },
  });

  try {
    await processor.process(connection.connect([], {}, controller.signal));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI stream timed out");
    }

    if (
      error instanceof Error &&
      /aborted|abort/i.test(error.message)
    ) {
      throw new Error("AI stream timed out");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const streamStudyPlan = (
  onDelta: (delta: string) => void,
  callbacks?: StreamCallbacks
) => streamSse("/ai/study-plan", onDelta, callbacks);

export const streamDeadlineInsights = (
  onDelta: (delta: string) => void,
  callbacks?: StreamCallbacks
) => streamSse("/ai/deadline-insights", onDelta, callbacks);

export type GenerateAssignmentsResponse = {
  createdAssignments: number;
  createdSubtasks: number;
  skippedAssignments: number;
  generatedCounts: {
    assignments: number;
    subtasks: number;
  };
};

export const generateAssignmentsFromAi = async () => {
  const { data } = await baseApi.post<GenerateAssignmentsResponse>(
    "/ai/generate-assignments",
    {},
    { timeout: 90_000 }
  );
  return data;
};
