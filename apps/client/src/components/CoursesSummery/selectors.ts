import { formatSemesterLabel } from "../../utils/semesterLabel";
import {
  assignments,
  courses,
  exams,
  semesterCourses,
  semesters,
  studentSemesterCourses,
} from "../UpcomingEvents/mockData";
import type { CourseSummaryViewItem, UpcomingEventViewItem } from "./types";

const getCourseContextByStudentSemesterCourseId = (
  studentSemesterCourseId: string
) => {
  const studentSemesterCourse = studentSemesterCourses.find(
    (item) => item.id === studentSemesterCourseId
  );

  if (!studentSemesterCourse) {
    return null;
  }

  const semesterCourse = semesterCourses.find(
    (item) => item.id === studentSemesterCourse.semesterCourseId
  );

  if (!semesterCourse) {
    return null;
  }

  const course = courses.find((item) => item.id === semesterCourse.courseId);
  const semester = semesters.find(
    (item) => item.id === semesterCourse.semesterId
  );

  if (!course || !semester) {
    return null;
  }

  const semesterLabel = formatSemesterLabel(semester.semesterNumber);

  return {
    courseId: course.id,
    courseTitle: course.title,
    semesterLabel: semesterLabel ? `סמסטר ${semesterLabel}` : null,
  };
};

const examTypeToDisplayText = (type: number) => {
  switch (type) {
    case 1:
      return "מבחן";
    case 2:
      return "מועד ב'";
    default:
      return "בחינה";
  }
};

export const getUpcomingEventItems = (): UpcomingEventViewItem[] => {
  const assignmentItems: UpcomingEventViewItem[] = assignments
    .map((assignment) => {
      const context = getCourseContextByStudentSemesterCourseId(
        assignment.studentSemesterCourseId
      );

      if (!context) {
        return null;
      }

      return {
        id: assignment.id,
        kind: "assignment",
        courseTitle: context.courseTitle,
        description: assignment.description,
        eventDate: assignment.deadline,
        semesterLabel: context.semesterLabel,
      };
    })
    .filter((item): item is UpcomingEventViewItem => item !== null);

  const examItems: UpcomingEventViewItem[] = exams
    .map((exam) => {
      const context = getCourseContextByStudentSemesterCourseId(
        exam.studentSemesterCourseId
      );

      if (!context) {
        return null;
      }

      return {
        id: exam.id,
        kind: "exam",
        courseTitle: context.courseTitle,
        description: examTypeToDisplayText(exam.type),
        eventDate: exam.date,
        semesterLabel: context.semesterLabel,
      };
    })
    .filter((item): item is UpcomingEventViewItem => item !== null);

  return [...assignmentItems, ...examItems].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );
};

export const getCourseSummaryItems = (): CourseSummaryViewItem[] => {
  return studentSemesterCourses
    .map((studentSemesterCourse) => {
      const context = getCourseContextByStudentSemesterCourseId(
        studentSemesterCourse.id
      );

      if (!context) {
        return null;
      }

      return {
        id: studentSemesterCourse.id,
        studentSemesterCourseId: studentSemesterCourse.id,
        courseId: context.courseId,
        courseTitle: context.courseTitle,
        semesterLabel: context.semesterLabel,
      };
    })
    .filter((item): item is CourseSummaryViewItem => item !== null)
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, "he"));
};
