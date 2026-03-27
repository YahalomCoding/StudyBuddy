import { OpenRouterModelOptionsByName } from "@tanstack/ai-openrouter";
import z from "zod";

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z
    .string()
    .default("nvidia/nemotron-3-nano-30b-a3b:free")
    .transform((modelName) => {
      return modelName as keyof OpenRouterModelOptionsByName;
    }),
});

export const env = envSchema.parse(process.env);
