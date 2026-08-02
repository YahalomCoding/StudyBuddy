import { z } from "zod";

export const generatedAssignmentTypeSchema = z.enum([
  "homework",
  "practice",
  "project",
  "report",
  "lab",
]);

export const generatedAssignmentSchema = z.object({
  title: z.string().min(1),
  courseTitle: z.string().min(1),
  dueDateIso: z.string().min(1),
  type: generatedAssignmentTypeSchema,
});

export const generatedSubtaskSchema = z.object({
  title: z.string().min(1),
  estimatedTimeMinutes: z.number().int().min(15).max(360),
  courseTitle: z.string().min(1).optional(),
});

export const assignmentGenerationResultSchema = z.object({
  assignments: z.array(generatedAssignmentSchema),
  subtasks: z.array(generatedSubtaskSchema),
});

export type GeneratedAssignment = z.infer<typeof generatedAssignmentSchema>;
export type GeneratedSubtask = z.infer<typeof generatedSubtaskSchema>;
export type AssignmentGenerationResult = z.infer<
  typeof assignmentGenerationResultSchema
>;
