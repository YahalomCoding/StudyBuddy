import { useMutation } from "@tanstack/react-query";
import type { QuestionnaireForm } from "../types";

export const useCreateQuestionnaireMutation = () => {
  return useMutation({
    mutationFn: async (payload: QuestionnaireForm) => {
      //Tali TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Submitted questionnaire:", payload);
      return payload;
    },
  });
};
