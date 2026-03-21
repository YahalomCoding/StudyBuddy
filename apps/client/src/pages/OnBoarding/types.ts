export const preferredAddressLanguages = [
  "English",
  "Hebrew",
  "Arabic",
  "Russian",
] as const;

export type PreferredAddressLanguage =
  (typeof preferredAddressLanguages)[number];

export interface QuestionnaireForm {
  nickname: string;
}
