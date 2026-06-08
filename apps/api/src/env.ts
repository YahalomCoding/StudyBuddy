import { config as loadEnv } from "dotenv";
import path from "node:path";
import z from "zod";

loadEnv({ path: path.resolve(__dirname, "../.env") });

const envSchema = z.object({
  PORT: z.string().optional(),
  API_PORT: z.string().optional(),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z
    .string()
    .default("nvidia/nemotron-3-nano-30b-a3b:free")
    .transform((modelName) => {
      return modelName;
    }),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
