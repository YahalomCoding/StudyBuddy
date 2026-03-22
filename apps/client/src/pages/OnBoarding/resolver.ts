import {
  questionnaireSchema,
  type QuestionnaireForm,
} from "@studybuddy/schemas";
import { type Resolver } from "react-hook-form";

export const questionnaireResolver: Resolver<QuestionnaireForm> = async (
  values
) => {
  const result = questionnaireSchema.safeParse(values);

  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: Record<string, { type: string; message: string }> = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join(".");

    if (!path || errors[path]) {
      continue;
    }

    errors[path] = {
      type: issue.code,
      message: issue.message,
    };
  }

  return {
    values: {},
    errors,
  };
};
