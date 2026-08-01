export type Semester = {
  id: string;
  yearNumber: number;
  semesterNumber: number;
};

export type Course = {
  id: string;
  title: string;
  degreeId: string;
  credits: number;
};

export type SemesterCourse = {
  id: string;
  semesterId: string;
  courseId: string;
};

export type StudentSemesterCourse = {
  id: string;
  studentId: string;
  semesterCourseId: string;
};

export type Assignment = {
  id: string;
  studentSemesterCourseId: string;
  description: string;
  deadline: string;
  grade?: number;
};

export type Exam = {
  id: string;
  studentSemesterCourseId: string;
  date: string;
  type: number;
  grade: number;
};

export type UpcomingEventViewItem = {
  id: string;
  kind: "assignment" | "exam";
  courseTitle: string;
  description: string;
  eventDate: string;
  semesterLabel: string;
};
