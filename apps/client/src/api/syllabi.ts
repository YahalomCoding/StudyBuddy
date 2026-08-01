import baseApi from "./baseApi";

export type AssessmentKind =
  | "assignment"
  | "exam"
  | "project"
  | "presentation"
  | "participation"
  | "lab"
  | "other";

export type Lecturer = {
  name: string | null;
  email: string | null;
  phone: string | null;
  officeHours: string | null;
  location: string | null;
};

export type SyllabusAssessment = {
  id: string;
  title: string;
  kind: AssessmentKind;
  weightPercent: number | null;
  submissionMode: "individual" | "group" | "unknown";
  groupSize: number | null;
  requiredPages: number | null;
  dueDate: string | null;
  createCalendarItem: boolean;
  notes: string | null;
};

export type SyllabusTopic = {
  id: string;
  order: number | null;
  title: string;
};

export type SyllabusData = {
  sourceLanguage: string | null;
  institution: string | null;
  faculty: string | null;
  course: {
    title: string | null;
    englishTitle: string | null;
    code: string | null;
    credits: number | null;
    weeklyHours: number | null;
    academicYearLabel: string | null;
    semesterLabel: string | null;
    semesterNumber: number | null;
  };
  lecturers: Lecturer[];
  prerequisites: string[];
  description: string | null;
  teachingMethod: string | null;
  learningOutcomes: string[];
  policies: string[];
  assessments: SyllabusAssessment[];
  topics: SyllabusTopic[];
  aiPolicy: string | null;
  bibliography: string[];
  notes: string[];
};

export type SyllabusPreview = {
  sourceFileName: string;
  pageCount: number;
  parser: "ai" | "heuristic";
  warnings: string[];
  missingFields: string[];
  availableDegrees: Array<{ id: string; title: string }>;
  destination: {
    degreeId: string | null;
    degreeTitle: string | null;
    yearNumber: number;
    semesterNumber: number;
  };
  syllabus: SyllabusData;
};

export type ConfirmSyllabusResponse = {
  courseId: string;
  studentSemesterCourseId: string;
  syllabusId: string;
  createdAssignments: number;
  createdExams: number;
  skippedCalendarItems: number;
};

export const previewSyllabus = async (file: File): Promise<SyllabusPreview> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await baseApi.post<SyllabusPreview>(
    "/syllabi/preview",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data;
};

export const confirmSyllabus = async (
  preview: SyllabusPreview,
): Promise<ConfirmSyllabusResponse> => {
  const response = await baseApi.post<ConfirmSyllabusResponse>(
    "/syllabi/confirm",
    {
      sourceFileName: preview.sourceFileName,
      parser: preview.parser,
      destination: preview.destination,
      syllabus: preview.syllabus,
    },
  );

  return response.data;
};
