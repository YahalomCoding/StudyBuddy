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

export interface QuestionnaireForm {
  nickname: string;
  studyType?: StudyType;
  faculty?: Faculty;
  coursesPerSemester?: number;
  workStatus?: WorkStatus;
}
