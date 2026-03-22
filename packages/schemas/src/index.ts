import { z } from "zod";

// ── Enum value arrays (exported for UI dropdowns / server-side iteration) ────

export const preferredAddressLanguages = [
  "English",
  "Hebrew",
  "Arabic",
  "Russian",
] as const;
export type PreferredAddressLanguage =
  (typeof preferredAddressLanguages)[number];

export const studyTypes = [
  "תיכון",
  "מכינה",
  "אוניברסיטה",
  "מכללה",
  "אחר",
] as const;
export type StudyType = (typeof studyTypes)[number];

export const faculties = [
  "רפואה",
  "מדמ״ח",
  "כלכלה",
  "הנדסה",
  "מדעים",
  "אחר",
] as const;
export type Faculty = (typeof faculties)[number];

export const workStatuses = ["לא", "חצי משרה", "משרה מלאה"] as const;
export type WorkStatus = (typeof workStatuses)[number];

export const studyAvailabilityDays = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;
export type StudyAvailabilityDay = (typeof studyAvailabilityDays)[number];

export const focusTimes = ["בוקר", "צהריים", "ערב", "לילה"] as const;
export type FocusTime = (typeof focusTimes)[number];

export const preferredStudyDurations = ["25", "50", "90"] as const;
export type PreferredStudyDuration = (typeof preferredStudyDurations)[number];

export const semesterFocusGoals = [
  "שיפור ציונים",
  "הבנה עמוקה",
  "רק לעבור",
  "איזון חיים",
] as const;
export type SemesterFocusGoal = (typeof semesterFocusGoals)[number];

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Convert NaN (from an empty <input type="number">) to undefined so Zod's
 *  required-error message fires instead of an invalid_type message. */
const nanToUndefined = (val: unknown): unknown =>
  typeof val === "number" && Number.isNaN(val) ? undefined : val;

// ── Questionnaire schema (single source of truth) ────────────────────────────

export const questionnaireSchema = z.object({
  nickname: z.string().min(2, "השם חייב להיות לפחות 2 תווים"),

  studyType: z.enum(studyTypes, { error: "יש לבחור סוג לימודים" }),
  faculty: z.enum(faculties, { error: "יש לבחור תחום / פקולטה" }),
  coursesPerSemester: z.preprocess(
    nanToUndefined,
    z
      .number({ error: "יש להזין מספר קורסים" })
      .int()
      .min(1, "מספר הקורסים חייב להיות לפחות 1")
  ),
  workStatus: z.enum(workStatuses, { error: "יש לבחור סטטוס עבודה" }),

  studyAvailabilityDays: z
    .array(z.enum(studyAvailabilityDays))
    .min(1, "יש לבחור לפחות יום אחד"),
  realisticStudyHoursPerDay: z.preprocess(
    nanToUndefined,
    z
      .number({ error: "יש להזין שעות לימוד ביום" })
      .min(1, "לפחות שעה אחת")
      .max(16, "עד 16 שעות ביום")
  ),
  focusTime: z.enum(focusTimes, { error: "יש לבחור זמן ריכוז" }),
  preferredStudyDuration: z.enum(preferredStudyDurations, {
    error: "יש לבחור משך למידה מועדף",
  }),

  strongTopics: z.string().min(1, "יש להזין נושאים חזקים"),
  challengingTopics: z.string().min(1, "יש להזין נושאים מאתגרים"),
  semesterFocusGoal: z.enum(semesterFocusGoals, {
    error: "יש לבחור דגש לסמסטר",
  }),
});

export type QuestionnaireForm = z.infer<typeof questionnaireSchema>;

// ── Legacy example schema (kept for API backward-compat) ─────────────────────

export const getExampleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});
export type Example = z.infer<typeof getExampleSchema>;
