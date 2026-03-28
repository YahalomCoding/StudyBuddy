export type UpcomingEventViewItem = {
  id: string;
  kind: "assignment" | "exam";
  courseTitle: string;
  description: string;
  eventDate: string;
  semesterLabel: string;
};

export type CourseSummaryViewItem = {
  id: string;
  studentSemesterCourseId: string;
  courseTitle: string;
  semesterLabel: string;
  courseId: string;
};