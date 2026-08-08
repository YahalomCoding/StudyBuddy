import baseApi from "./baseApi";

export type GradeAssessmentKind =
  | "assignment"
  | "exam"
  | "project"
  | "presentation"
  | "participation"
  | "lab"
  | "other";

export type GradeAssessmentItem = {
  id: string;
  databaseId: string | null;
  source: "syllabus" | "assignment" | "exam";
  title: string;
  kind: GradeAssessmentKind;
  typeLabel: string;
  gradeType: "assignment" | "exam";
  weightPercent: number | null;
  grade: number | null;
  dueDate: string | null;
  weightedContribution: number | null;
};

export type GradesResponseItem = {
  courseId: string;
  studentSemesterCourseId: string;
  courseTitle: string;
  semesterYearNumber: number | null;
  semesterNumber: number | null;
  credits: number;
  examGrade: number | null;
  assignmentGrade: number | null;
  finalGrade: number | null;
  currentGrade: number | null;
  totalWeightPercent: number;
  completedWeightPercent: number;
  examId?: string | null;
  assignmentId?: string | null;
  assessments: GradeAssessmentItem[];
};

export type UpdateCourseGradesPayload = {
  examGrade?: number | null;
  assignmentGrade?: number | null;
  examId?: string | null;
  assignmentId?: string | null;
  assessmentTitle?: string | null;
  assessmentDueDate?: string | null;
  assessmentKind?: GradeAssessmentKind | null;
};

export const gradesQueryKey = ["grades"] as const;

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

export const updateAssessmentWeight = async (
  courseId: string,
  assessmentId: string,
  weightPercent: number
) => {
  const { data } = await baseApi.patch<GradesResponseItem[]>(
    `/grades/${courseId}/weight`,
    { assessmentId, weightPercent }
  );

  return data;
};
