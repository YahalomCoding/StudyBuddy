import baseApi from "./baseApi";

export type GradesResponseItem = {
  courseId: string;
  courseTitle: string;
  credits: number;
  examGrade: number | null;
  assignmentGrade: number | null;
  finalGrade: number | null;
};

export const getGrades = async () => {
  const { data } = await baseApi.get<GradesResponseItem[]>("/grades");
  return data;
};
