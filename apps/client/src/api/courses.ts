import baseApi from "./baseApi";

export type CourseDetailsLecturer = {
  name: string | null;
  email: string | null;
  phone: string | null;
  officeHours: string | null;
  location: string | null;
};

export type CourseDetailsTopic = {
  id: string;
  order: number;
  title: string;
};

export type CourseDetailsAssessment = {
  id: string;
  databaseId: string | null;
  source: "syllabus" | "assignment" | "exam";
  title: string;
  kind:
    | "assignment"
    | "exam"
    | "project"
    | "presentation"
    | "participation"
    | "lab"
    | "other";
  typeLabel: string;
  weightPercent: number | null;
  dueDate: string | null;
  status: "not started" | "active" | "done" | null;
  grade: number | null;
  submissionMode: "individual" | "group" | "unknown";
  groupSize: number | null;
  requiredPages: number | null;
  notes: string | null;
};

export type CourseDetailsResponse = {
  studentSemesterCourseId: string;
  courseId: string;
  semesterCourseId: string;
  degreeId: string;
  degreeTitle: string;

  title: string;
  englishTitle: string | null;
  code: string | null;
  credits: number | null;
  weeklyHours: number | null;

  academicYearLabel: string;
  semesterLabel: string;
  yearNumber: number;
  semesterNumber: number;

  institution: string | null;
  faculty: string | null;
  grade: number | null;

  lecturers: CourseDetailsLecturer[];
  description: string | null;
  teachingMethod: string | null;
  prerequisites: string[];
  learningOutcomes: string[];
  topics: CourseDetailsTopic[];
  policies: string[];
  aiPolicy: string | null;
  bibliography: string[];
  notes: string[];

  assessments: CourseDetailsAssessment[];

  syllabus: {
    exists: boolean;
    id: string | null;
    sourceFileName: string | null;
    parser: "ai" | "heuristic" | null;
    confirmedAt: string | null;
  };
};

export const courseDetailsQueryKey = (
  studentSemesterCourseId: string | null,
) =>
  ["course-details", studentSemesterCourseId] as const;

export const getCourseDetails = async (
  studentSemesterCourseId: string,
): Promise<CourseDetailsResponse> => {
  const response = await baseApi.get<CourseDetailsResponse>(
    `/courses/${studentSemesterCourseId}/details`,
  );

  return response.data;
};