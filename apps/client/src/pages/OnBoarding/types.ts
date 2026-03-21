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

export interface QuestionnaireForm {
  nickname: string;
  studyType?: StudyType;
  faculty?: Faculty;
  coursesPerSemester?: number;
  workStatus?: WorkStatus;
  studyAvailabilityDays: StudyAvailabilityDay[];
  realisticStudyHoursPerDay?: number;
  focusTime?: FocusTime;
  preferredStudyDuration?: PreferredStudyDuration;
  strongTopics: string;
  challengingTopics: string;
  semesterFocusGoal?: SemesterFocusGoal;
}
