import type { QuestionnaireForm } from "@studybuddy/schemas";
import { useMutation } from "@tanstack/react-query";
import baseApi from "../../../api/baseApi";

export const useCreateQuestionnaireMutation = () => {
  return useMutation({
    mutationFn: async (payload: QuestionnaireForm) => {
      const { data } = await baseApi.post("/questionnaire", payload);
      return data;
    },
  });
};
