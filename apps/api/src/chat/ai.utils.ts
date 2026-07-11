import { env } from "../env";
// @ts-expect-error -- @langfuse/client is ESM-only; the require call works at runtime
import { LangfuseClient } from "@langfuse/client";

const langfuse = new LangfuseClient();

const chatPromise = import("@tanstack/ai").then((module) => module.chat);
const createOpenRouterTextPromise = import("@tanstack/ai-openrouter").then(
  (module) => module.createOpenRouterText
);

const aiTextProviderAdapterPromise = createOpenRouterTextPromise.then(
  (createOpenRouterText) =>
    createOpenRouterText(env.OPENROUTER_MODEL as any, env.OPENROUTER_API_KEY)
);

export const loadAiChat = async () => {
  const [chat, aiTextProviderAdapter] = await Promise.all([
    chatPromise,
    aiTextProviderAdapterPromise,
  ]);
  return {
    chat,
    aiTextProviderAdapter,
  };
};

declare global {
  var CACHED_SYSTEM_PROMPTS:
    | Record<string, { promptName: string; prompt: string; version: number }>
    | undefined;
}
global.CACHED_SYSTEM_PROMPTS = global.CACHED_SYSTEM_PROMPTS ?? {};
const CACHED_SYSTEM_PROMPTS = global.CACHED_SYSTEM_PROMPTS!;

export const getSystemPrompt = async (
  promptName: string
): Promise<(typeof CACHED_SYSTEM_PROMPTS)[string]> => {
  if (CACHED_SYSTEM_PROMPTS[promptName]) {
    return CACHED_SYSTEM_PROMPTS[promptName];
  }
  const prompt = await langfuse.prompt.get(promptName);
  CACHED_SYSTEM_PROMPTS[promptName] = {
    promptName: prompt.name,
    prompt: prompt.prompt,
    version: prompt.version,
  };
  return CACHED_SYSTEM_PROMPTS[promptName];
};
