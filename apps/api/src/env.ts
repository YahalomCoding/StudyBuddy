import z from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  API_PORT: z.string().optional(),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z
    .enum(["nvidia/nemotron-3-nano-30b-a3b:free"])
    .default("nvidia/nemotron-3-nano-30b-a3b:free")
    .transform((modelName) => modelName),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
});

export const env = envSchema.parse(process.env);
