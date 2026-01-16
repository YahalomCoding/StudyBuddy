import z from "zod";

export const exampleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});
export type Example = z.infer<typeof exampleSchema>;
