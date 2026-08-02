import baseApi from "./baseApi";

export type GradesResponseItem = {
  courseId: string;
  courseTitle: string;
  semesterYearNumber: number | null;
  semesterNumber: number | null;
  credits: number;
  examGrade: number | null;
  assignmentGrade: number | null;
  finalGrade: number | null;
  examId?: string | null;
  assignmentId?: string | null;
};

export type UpdateCourseGradesPayload = {
  examGrade?: number | null;
  assignmentGrade?: number | null;
  examId?: string | null;
  assignmentId?: string | null;
};

export const getGrades = async () => {
  const { data } = await baseApi.get<GradesResponseItem[]>("/grades");
  return data;
};

export const updateCourseGrades = async (
  courseId: string,
  payload: UpdateCourseGradesPayload
) => {
  const { data } = await baseApi.patch<GradesResponseItem[]>(
    `/grades/${courseId}`,
    payload
  );
  return data;
};
