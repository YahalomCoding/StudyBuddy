import { toolDefinition } from "@tanstack/ai";
import z from "zod";

const toonOutputSchema = z
  .string()
  .describe("TOON-encoded payload string. Parse as TOON, not JSON.");

export const getCurrentTimeServerDef = toolDefinition({
  name: "get_current_time",
  description: "Get the current server date and time. Use this when the user asks what time or date it is.",
  inputSchema: z.object({}),
  outputSchema: toonOutputSchema,
});

export const studentListInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Maximum number of items to return (1-50)."),
});

const taskStatusFilterSchema = z
  .enum(["all", "open", "done"])
  .optional()
  .describe("Filter tasks by status. Defaults to open.");

const assignmentStatusFilterSchema = z
  .enum(["all", "open", "done"])
  .optional()
  .describe("Filter assignments by status. Defaults to open.");

export const getStudentExamsInputSchema = z.object({
  upcomingOnly: z
    .boolean()
    .optional()
    .describe("If true, only returns exams in the future. Defaults to true."),
  fromDate: z
    .string()
    .optional()
    .describe("ISO date string. Only exams on/after this date will be returned."),
  toDate: z
    .string()
    .optional()
    .describe("ISO date string. Only exams on/before this date will be returned."),
  ...studentListInputSchema.shape,
});

export const getUserProfileServerDef = toolDefinition({
  name: "get_user_profile",
  description:
    "Get the student profile and study preferences for personalized planning help.",
  inputSchema: z.object({}),
  outputSchema: toonOutputSchema,
});

export const getStudentCoursesInputSchema = studentListInputSchema;

export const getStudentCoursesServerDef = toolDefinition({
  name: "get_student_courses",
  description:
    "Get courses linked to the current student for the active semester data set.",
  inputSchema: studentListInputSchema,
  outputSchema: toonOutputSchema,
});

export const getStudentTasksInputSchema = z.object({
  status: taskStatusFilterSchema,
  ...studentListInputSchema.shape,
});

export const getStudentTasksServerDef = toolDefinition({
  name: "get_student_tasks",
  description:
    "Get the student's general tasks, including due dates, completion state, and time estimates.",
  inputSchema: getStudentTasksInputSchema,
  outputSchema: toonOutputSchema,
});

export const getStudentAssignmentsInputSchema = z.object({
  status: assignmentStatusFilterSchema,
  ...studentListInputSchema.shape,
});

export const getStudentAssignmentsServerDef = toolDefinition({
  name: "get_student_assignments",
  description:
    "Get the student's assignments with status, deadlines, and linked course information.",
  inputSchema: getStudentAssignmentsInputSchema,
  outputSchema: toonOutputSchema,
});

export const getStudentExamsServerDef = toolDefinition({
  name: "get_student_exams",
  description:
    "Get the student's exams with date, type, grade, and course title.",
  inputSchema: getStudentExamsInputSchema,
  outputSchema: toonOutputSchema,
});

export const getStudentAcademicOverviewServerDef = toolDefinition({
  name: "get_student_academic_overview",
  description:
    "Get a compact dashboard of counts and closest deadlines for quick academic status answers.",
  inputSchema: z.object({}),
  outputSchema: toonOutputSchema,
});