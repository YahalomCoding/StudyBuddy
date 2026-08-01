import { config as loadEnv } from "dotenv";
import path from "node:path";
import z from "zod";

loadEnv({ path: path.resolve(__dirname, "../.env") });

const envSchema = z.object({
  PORT: z.string().optional(),
  API_PORT: z.string().optional(),

  OPENROUTER_API_KEY: z
    .string()
    .trim()
    .min(1, "OPENROUTER_API_KEY is required"),

  OPENROUTER_MODEL: z
    .string()
    .trim()
    .min(1, "OPENROUTER_MODEL is required")
    .default("nvidia/nemotron-3-nano-30b-a3b:free"),

  SYLLABUS_AI_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(180_000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),

  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),

  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_BASE_URL: z.url().optional().default("https://cloud.langfuse.com"),
});

export const env = envSchema.parse(process.env);