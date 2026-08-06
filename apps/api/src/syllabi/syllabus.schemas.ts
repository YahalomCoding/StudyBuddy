import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const nullableText = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}, z.string().nullable());

const nullableNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}, z.number().nullable());

const nullableInteger = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}, z.number().int().nullable());

const nullableDateText = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}, z.string().nullable());

export const assessmentKinds = [
  "assignment",
  "exam",
  "project",
  "presentation",
  "participation",
  "lab",
  "other",
] as const;

export const lecturerSchema = z.object({
  name: nullableText.default(null),
  email: nullableText.default(null),
  phone: nullableText.default(null),
  officeHours: nullableText.default(null),
  location: nullableText.default(null),
});

export const assessmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  kind: z.enum(assessmentKinds).default("other"),
  weightPercent: nullableNumber.default(null),
  submissionMode: z.enum(["individual", "group", "unknown"]).default("unknown"),
  groupSize: nullableInteger.default(null),
  requiredPages: nullableInteger.default(null),
  dueDate: nullableDateText.default(null),
  createCalendarItem: z.boolean().default(false),
  notes: nullableText.default(null),
});

export const topicSchema = z.object({
  id: z.string().min(1),
  order: nullableInteger.default(null),
  title: z.string().trim().min(1),
});

export const syllabusCourseSchema = z.object({
  title: nullableText.default(null),
  englishTitle: nullableText.default(null),
  code: nullableText.default(null),
  credits: nullableNumber.default(null),
  weeklyHours: nullableNumber.default(null),
  academicYearLabel: nullableText.default(null),
  semesterLabel: nullableText.default(null),
  semesterNumber: nullableInteger.default(null),
});

export const syllabusDataSchema = z.object({
  sourceLanguage: nullableText.default(null),
  institution: nullableText.default(null),
  faculty: nullableText.default(null),
  course: syllabusCourseSchema,
  lecturers: z.array(lecturerSchema).default([]),
  prerequisites: z.array(z.string()).default([]),
  description: nullableText.default(null),
  teachingMethod: nullableText.default(null),
  learningOutcomes: z.array(z.string()).default([]),
  policies: z.array(z.string()).default([]),
  assessments: z.array(assessmentSchema).default([]),
  topics: z.array(topicSchema).default([]),
  aiPolicy: nullableText.default(null),
  bibliography: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

const aiLecturerSchema = lecturerSchema.strict();

const aiAssessmentSchema = z
  .object({
    title: nullableText.default(null),
    kind: z.enum(assessmentKinds).default("other"),
    weightPercent: nullableNumber.default(null),
    submissionMode: z
      .enum(["individual", "group", "unknown"])
      .default("unknown"),
    groupSize: nullableInteger.default(null),
    requiredPages: nullableInteger.default(null),
    dueDate: nullableDateText.default(null),
    notes: nullableText.default(null),
  })
  .strict();

const aiTopicSchema = z
  .object({
    order: nullableInteger.default(null),
    title: nullableText.default(null),
  })
  .strict();

export const aiSyllabusDataSchema = z
  .object({
    sourceLanguage: nullableText.default(null),
    institution: nullableText.default(null),
    faculty: nullableText.default(null),
    course: syllabusCourseSchema.strict(),
    lecturers: z.array(aiLecturerSchema).default([]),
    prerequisites: z.array(z.string()).default([]),
    description: nullableText.default(null),
    teachingMethod: nullableText.default(null),
    learningOutcomes: z.array(z.string()).default([]),
    policies: z.array(z.string()).default([]),
    assessments: z.array(aiAssessmentSchema).default([]),
    topics: z.array(aiTopicSchema).default([]),
    aiPolicy: nullableText.default(null),
    bibliography: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
  })
  .strict();

export const importDestinationSchema = z
  .object({
    degreeId: z.string().uuid().nullable(),
    degreeTitle: z.string().trim().nullable(),
    yearNumber: z.number().int().min(2000).max(2200),
    semesterNumber: z.number().int().min(1).max(3),
  })
  .superRefine((value, context) => {
    const hasExistingDegree = Boolean(value.degreeId);
    const hasNewDegreeTitle = Boolean(value.degreeTitle?.trim());

    if (!hasExistingDegree && !hasNewDegreeTitle) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["degreeTitle"],
        message: "Choose an existing degree or enter a new degree name",
      });
    }
  });

export const confirmSyllabusRequestSchema = z.object({
  sourceFileName: z.string().trim().min(1),
  parser: z.enum(["ai", "heuristic"]),
  destination: importDestinationSchema,
  syllabus: syllabusDataSchema.extend({
    course: syllabusCourseSchema.extend({
      title: z.string().trim().min(1, "Course title is required"),
    }),
  }),
});

export class ConfirmSyllabusDto extends createZodDto(
  confirmSyllabusRequestSchema,
) {}

export type AiSyllabusData = z.infer<typeof aiSyllabusDataSchema>;
export type SyllabusData = z.infer<typeof syllabusDataSchema>;
export type ConfirmSyllabusRequest = z.infer<
  typeof confirmSyllabusRequestSchema
>;
export type AssessmentKind = (typeof assessmentKinds)[number];