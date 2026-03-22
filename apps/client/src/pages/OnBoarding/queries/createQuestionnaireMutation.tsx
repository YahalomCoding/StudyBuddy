import type { QuestionnaireForm } from "@studybuddy/schemas";
import { useMutation } from "@tanstack/react-query";

export const useCreateQuestionnaireMutation = () => {
  return useMutation({
    mutationFn: async (payload: QuestionnaireForm) => {
      // TODO: replace with real API call when server endpoint is ready.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return payload;
    },
  });
};
