import type { QuestionnaireForm } from "@studybuddy/schemas";
import { useMutation } from "@tanstack/react-query";
import baseApi from "../../../api/baseApi";
import type { AuthResponse } from "../../../api/auth";

export const useCreateQuestionnaireMutation = () => {
  return useMutation({
    mutationFn: async (payload: QuestionnaireForm) => {
      const { data } = await baseApi.post<AuthResponse>(
        "/questionnaire",
        payload
      );

      return data;
    },
  });
};
