import type { SyllabusData } from "../syllabi/syllabus.schemas";

type SyllabusLecturer = SyllabusData["lecturers"][number];
type SyllabusSubmissionMode =
  SyllabusData["assessments"][number]["submissionMode"];

export type CourseDetailsAssessmentSource =
  | "syllabus"
  | "assignment"
  | "exam";

export type CourseDetailsAssessment = {
  id: string;
  databaseId: string | null;
  source: CourseDetailsAssessmentSource;
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
  submissionMode: SyllabusSubmissionMode;
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

  lecturers: SyllabusLecturer[];
  description: string | null;
  teachingMethod: string | null;
  prerequisites: string[];
  learningOutcomes: string[];
  topics: {
    id: string;
    order: number;
    title: string;
  }[];
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