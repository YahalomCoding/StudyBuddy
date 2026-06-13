import { env } from "../env";

const chatPromise = import("@tanstack/ai").then((module) => module.chat);
const createOpenRouterTextPromise = import("@tanstack/ai-openrouter").then(
  (module) => module.createOpenRouterText
);

const aiTextProviderAdapterPromise = createOpenRouterTextPromise.then(
  (createOpenRouterText) =>
    createOpenRouterText(env.OPENROUTER_MODEL, env.OPENROUTER_API_KEY)
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
