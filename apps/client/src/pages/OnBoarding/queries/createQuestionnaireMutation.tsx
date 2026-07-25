import type { QuestionnaireForm } from "@studybuddy/schemas";
import { useMutation } from "@tanstack/react-query";
import baseApi from "../../../api/baseApi";
import type { AuthResponse } from "../../../api/auth";

const TOKEN_KEY = "studybuddy_access_token";

export const useCreateQuestionnaireMutation = () => {
  return useMutation({
    mutationFn: async (payload: QuestionnaireForm) => {
      const { data } = await baseApi.post<AuthResponse>(
        "/questionnaire",
        payload
      );

      localStorage.setItem(TOKEN_KEY, data.accessToken);
      baseApi.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

      return data;
    },
  });
};
