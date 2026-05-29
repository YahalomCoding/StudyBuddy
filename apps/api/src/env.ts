import { OpenRouterModelOptionsByName } from "@tanstack/ai-openrouter";
import z from "zod";

const envSchema = z.object({
  PORT: z.string(),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z
    .string()
    .default("nvidia/nemotron-3-nano-30b-a3b:free")
    .transform((modelName) => {
      return modelName as keyof OpenRouterModelOptionsByName;
    }),
  DB_HOST: z.string(),
  DB_PORT: z
    .string()
    .default("5432")
    .transform((port) => parseInt(port)),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  // Langfuse tracing & prompt management
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_BASE_URL: z.url()
    .optional()
    .default("https://cloud.langfuse.com"),
});

export const env = envSchema.parse(process.env);
