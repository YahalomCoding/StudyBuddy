import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionnaireSchema,
  type QuestionnaireForm,
  type QuestionnaireFormInput,
} from "@studybuddy/schemas";

export const questionnaireResolver = zodResolver<
  QuestionnaireFormInput,
  unknown,
  QuestionnaireForm
>(questionnaireSchema);
