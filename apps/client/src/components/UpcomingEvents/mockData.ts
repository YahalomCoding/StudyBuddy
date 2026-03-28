import type {
  Assignment,
  Course,
  Exam,
  Semester,
  SemesterCourse,
  StudentSemesterCourse,
} from "./types";

export const semesters: Semester[] = [
  { id: "sem-1", yearNumber: 2026, semesterNumber: 2 },
  { id: "sem-2", yearNumber: 2026, semesterNumber: 1 },
];

export const courses: Course[] = [
  { id: "course-1", title: "אלגברה לינארית", degreeId: "deg-1" },
  { id: "course-2", title: "מבני נתונים", degreeId: "deg-1" },
  { id: "course-3", title: "מסדי נתונים", degreeId: "deg-1" },
  { id: "course-4", title: "סטטיסטיקה", degreeId: "deg-1" },
  { id: "course-5", title: "כלכלה", degreeId: "deg-2" },
  { id: "course-6", title: "תכן תוכנה", degreeId: "deg-1" },
  { id: "course-7", title: "פיזיקה", degreeId: "deg-3" },
  { id: "course-8", title: "אנגלית", degreeId: "deg-4" },
  { id: "course-9", title: "ביולוגיה", degreeId: "deg-5" },
  { id: "course-10", title: "מבוא לתכנות", degreeId: "deg-1" },
];

export const semesterCourses: SemesterCourse[] = [
  { id: "sc-1", semesterId: "sem-1", courseId: "course-1" },
  { id: "sc-2", semesterId: "sem-1", courseId: "course-2" },
  { id: "sc-3", semesterId: "sem-1", courseId: "course-3" },
  { id: "sc-4", semesterId: "sem-1", courseId: "course-4" },
  { id: "sc-5", semesterId: "sem-1", courseId: "course-5" },
  { id: "sc-6", semesterId: "sem-1", courseId: "course-6" },
  { id: "sc-7", semesterId: "sem-1", courseId: "course-7" },
  { id: "sc-8", semesterId: "sem-1", courseId: "course-8" },
  { id: "sc-9", semesterId: "sem-1", courseId: "course-9" },
  { id: "sc-10", semesterId: "sem-1", courseId: "course-10" },
];

export const studentSemesterCourses: StudentSemesterCourse[] = [
  { id: "ssc-1", studentId: "student-1", semesterCourseId: "sc-1" },
  { id: "ssc-2", studentId: "student-1", semesterCourseId: "sc-2" },
  { id: "ssc-3", studentId: "student-1", semesterCourseId: "sc-3" },
  { id: "ssc-4", studentId: "student-1", semesterCourseId: "sc-4" },
  { id: "ssc-5", studentId: "student-1", semesterCourseId: "sc-5" },
  { id: "ssc-6", studentId: "student-1", semesterCourseId: "sc-6" },
  { id: "ssc-7", studentId: "student-1", semesterCourseId: "sc-7" },
  { id: "ssc-8", studentId: "student-1", semesterCourseId: "sc-8" },
  { id: "ssc-9", studentId: "student-1", semesterCourseId: "sc-9" },
  { id: "ssc-10", studentId: "student-1", semesterCourseId: "sc-10" },
];

export const assignments: Assignment[] = [
  {
    id: "assignment-1",
    studentSemesterCourseId: "ssc-1",
    description: "הגשת תרגיל 1",
    deadline: "2026-03-24T12:00:00.000Z",
  },
  {
    id: "assignment-2",
    studentSemesterCourseId: "ssc-2",
    description: "דף תרגול סיבוכיות",
    deadline: "2026-03-25T12:00:00.000Z",
  },
  {
    id: "assignment-3",
    studentSemesterCourseId: "ssc-3",
    description: "טיוטת תכנון סכימה",
    deadline: "2026-03-22T12:00:00.000Z",
  },
  {
    id: "assignment-4",
    studentSemesterCourseId: "ssc-4",
    description: "סט תרגילים במבחני השערות",
    deadline: "2026-03-21T12:00:00.000Z",
  },
  {
    id: "assignment-5",
    studentSemesterCourseId: "ssc-5",
    description: "דוח ניתוח שוק",
    deadline: "2026-03-18T12:00:00.000Z",
  },
  {
    id: "assignment-6",
    studentSemesterCourseId: "ssc-6",
    description: "תרשים מחלקות UML",
    deadline: "2026-03-27T12:00:00.000Z",
  },
  {
    id: "assignment-7",
    studentSemesterCourseId: "ssc-7",
    description: "רפלקציה על מעבדה",
    deadline: "2026-03-19T12:00:00.000Z",
  },
  {
    id: "assignment-8",
    studentSemesterCourseId: "ssc-8",
    description: "חיבור מסכם",
    deadline: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "assignment-9",
    studentSemesterCourseId: "ssc-9",
    description: "סיכום מאמר מדעי",
    deadline: "2026-04-04T12:00:00.000Z",
  },
  {
    id: "assignment-10",
    studentSemesterCourseId: "ssc-10",
    description: "פרויקט סיום קטן",
    deadline: "2026-04-07T12:00:00.000Z",
  },
  {
    id: "assignment-11",
    studentSemesterCourseId: "ssc-1",
    description: "פתרון שאלות חזרה",
    deadline: "2026-04-09T12:00:00.000Z",
  },
  {
    id: "assignment-12",
    studentSemesterCourseId: "ssc-2",
    description: "בניית עץ חיפוש",
    deadline: "2026-04-12T12:00:00.000Z",
  },
];

export const exams: Exam[] = [
  {
    id: "exam-1",
    studentSemesterCourseId: "ssc-9",
    date: "2026-04-25T09:00:00.000Z",
    type: 1,
    grade: 65,
  },
  {
    id: "exam-2",
    studentSemesterCourseId: "ssc-8",
    date: "2026-04-26T12:00:00.000Z",
    type: 1,
    grade: 86,
  },
  {
    id: "exam-3",
    studentSemesterCourseId: "ssc-1",
    date: "2026-05-02T08:30:00.000Z",
    type: 2,
    grade: 72,
  },
  {
    id: "exam-4",
    studentSemesterCourseId: "ssc-3",
    date: "2026-05-05T10:00:00.000Z",
    type: 1,
    grade: 91,
  },
  {
    id: "exam-5",
    studentSemesterCourseId: "ssc-4",
    date: "2026-05-07T11:00:00.000Z",
    type: 2,
    grade: 78,
  },
  {
    id: "exam-6",
    studentSemesterCourseId: "ssc-5",
    date: "2026-05-10T13:00:00.000Z",
    type: 1,
    grade: 84,
  },
  {
    id: "exam-7",
    studentSemesterCourseId: "ssc-6",
    date: "2026-05-12T09:30:00.000Z",
    type: 1,
    grade: 88,
  },
];