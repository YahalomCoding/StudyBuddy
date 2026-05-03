import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { Transaction } from "sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/course.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { GeneralTask } from "../general-tasks/general-task.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { User } from "../users/user.model";

const DURATION_UNITS = ["minutes", "hours", "days"] as const;
type DurationUnit = (typeof DURATION_UNITS)[number];

const ASSIGNMENT_STATUSES = ["not started", "active", "done"] as const;
type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

const ASSIGNMENT_TYPES = [
  "homework",
  "practice",
  "project",
  "report",
  "lab",
] as const;
type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

type DashboardResponse = {
  todos: {
    id: string;
    title: string;
    dueDate: string;
    done: boolean;
    estimatedTime: { value: number; unit: DurationUnit };
  }[];
  assignments: {
    id: string;
    status: AssignmentStatus;
    course: string;
    title: string;
    dueDate: string;
    type: AssignmentType;
  }[];
  upcomingEvents: {
    id: string;
    kind: "assignment" | "exam";
    courseTitle: string;
    description: string;
    eventDate: string;
    semesterLabel: string;
  }[];
  coursesSummary: {
    id: string;
    studentSemesterCourseId: string;
    courseTitle: string;
    semesterLabel: string;
    courseId: string;
  }[];
};

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(Student) private readonly studentModel: typeof Student,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(GeneralTask)
    private readonly generalTaskModel: typeof GeneralTask,
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,
    @InjectModel(Exam) private readonly examModel: typeof Exam,
    @InjectModel(Degree) private readonly degreeModel: typeof Degree,
    @InjectModel(Course) private readonly courseModel: typeof Course,
    @InjectModel(Semester) private readonly semesterModel: typeof Semester,
    @InjectModel(SemesterCourse)
    private readonly semesterCourseModel: typeof SemesterCourse,
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse
  ) {}

  async seedDemoData() {
    const sequelize = this.studentModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const student = await this.findOrCreateSeedStudent(transaction);

      const semester = await this.findOrCreateSemester(2026, 2, transaction);

      const courses = [
        { title: "אלגברה לינארית", degreeTitle: "מדעי המחשב" },
        { title: "מבני נתונים", degreeTitle: "הנדסת תוכנה" },
        { title: "מסדי נתונים", degreeTitle: "מערכות מידע" },
        { title: "סטטיסטיקה", degreeTitle: "מדעי הנתונים" },
      ];

      const studentSemesterCourseByTitle = new Map<string, StudentSemesterCourse>();

      for (const [index, courseSeed] of courses.entries()) {
        const degree = await this.findOrCreateDegree(
          courseSeed.degreeTitle,
          index + 1,
          transaction
        );
        const course = await this.findOrCreateCourse(
          courseSeed.title,
          degree.id,
          transaction
        );
        const semesterCourse = await this.findOrCreateSemesterCourse(
          semester.id,
          course.id,
          transaction
        );
        const studentSemesterCourse = await this.findOrCreateStudentSemesterCourse(
          student.id,
          semesterCourse.id,
          transaction
        );

        studentSemesterCourseByTitle.set(courseSeed.title, studentSemesterCourse);
      }

      const todoSeeds = [
        {
          title: "חזרה על סיכומי אלגברה לינארית",
          dueDate: new Date(2026, 2, 23),
          done: false,
          estimatedTimeValue: 45,
          estimatedTimeUnit: "minutes" as const,
        },
        {
          title: "סיכום הרצאה במערכות הפעלה",
          dueDate: new Date(2026, 2, 24),
          done: true,
          estimatedTimeValue: 30,
          estimatedTimeUnit: "minutes" as const,
        },
        {
          title: "תרגול SQL joins",
          dueDate: new Date(2026, 2, 25),
          done: false,
          estimatedTimeValue: 60,
          estimatedTimeUnit: "minutes" as const,
        },
        {
          title: "כתיבת נקודות מפתח מקריאה בכלכלה",
          dueDate: new Date(2026, 2, 26),
          done: false,
          estimatedTimeValue: 40,
          estimatedTimeUnit: "minutes" as const,
        },
      ];

      let insertedTodos = 0;

      for (const todo of todoSeeds) {
        const [task, created] = await this.generalTaskModel.findOrCreate({
          where: {
            studentId: student.id,
            description: todo.title,
          },
          defaults: {
            studentId: student.id,
            description: todo.title,
            dueDate: todo.dueDate,
            done: todo.done,
            estimatedTimeValue: todo.estimatedTimeValue,
            estimatedTimeUnit: todo.estimatedTimeUnit,
          },
          transaction,
        });

        if (!created) {
          await task.update(
            {
              dueDate: todo.dueDate,
              done: todo.done,
              estimatedTimeValue: todo.estimatedTimeValue,
              estimatedTimeUnit: todo.estimatedTimeUnit,
            },
            { transaction }
          );
        } else {
          insertedTodos += 1;
        }
      }

      const assignmentSeeds = [
        {
          courseTitle: "מבני נתונים",
          title: "דף תרגול סיבוכיות",
          dueDate: new Date(2026, 2, 24),
          status: "not started" as const,
          type: "homework" as const,
          grade: null,
        },
        {
          courseTitle: "אלגברה לינארית",
          title: "הכנה לבוחן מטריצות",
          dueDate: new Date(2026, 2, 20),
          status: "done" as const,
          type: "practice" as const,
          grade: 92,
        },
        {
          courseTitle: "מסדי נתונים",
          title: "טיוטת תכנון סכימה",
          dueDate: new Date(2026, 2, 22),
          status: "active" as const,
          type: "project" as const,
          grade: null,
        },
        {
          courseTitle: "סטטיסטיקה",
          title: "סט תרגילים במבחני השערות",
          dueDate: new Date(2026, 2, 21),
          status: "active" as const,
          type: "homework" as const,
          grade: null,
        },
      ];

      let insertedAssignments = 0;

      for (const assignmentSeed of assignmentSeeds) {
        const studentSemesterCourse = studentSemesterCourseByTitle.get(
          assignmentSeed.courseTitle
        );

        if (!studentSemesterCourse) {
          continue;
        }

        const [assignment, created] = await this.assignmentModel.findOrCreate({
          where: {
            studentSemesterCourseId: studentSemesterCourse.id,
            description: assignmentSeed.title,
          },
          defaults: {
            studentSemesterCourseId: studentSemesterCourse.id,
            description: assignmentSeed.title,
            deadline: assignmentSeed.dueDate,
            status: assignmentSeed.status,
            type: assignmentSeed.type,
            grade: assignmentSeed.grade,
          },
          transaction,
        });

        if (!created) {
          await assignment.update(
            {
              deadline: assignmentSeed.dueDate,
              status: assignmentSeed.status,
              type: assignmentSeed.type,
              grade: assignmentSeed.grade,
            },
            { transaction }
          );
        } else {
          insertedAssignments += 1;
        }
      }

      const examSeeds = [
        {
          courseTitle: "אלגברה לינארית",
          date: new Date(2026, 3, 25, 9, 0, 0),
          type: 1,
          grade: 86,
        },
        {
          courseTitle: "מסדי נתונים",
          date: new Date(2026, 3, 28, 12, 0, 0),
          type: 2,
          grade: 79,
        },
      ];

      let insertedExams = 0;

      for (const examSeed of examSeeds) {
        const studentSemesterCourse = studentSemesterCourseByTitle.get(
          examSeed.courseTitle
        );

        if (!studentSemesterCourse) {
          continue;
        }

        const [exam, created] = await this.examModel.findOrCreate({
          where: {
            studentSemesterCourseId: studentSemesterCourse.id,
            date: examSeed.date,
            type: examSeed.type,
          },
          defaults: {
            studentSemesterCourseId: studentSemesterCourse.id,
            date: examSeed.date,
            type: examSeed.type,
            grade: examSeed.grade,
          },
          transaction,
        });

        if (!created) {
          await exam.update({ grade: examSeed.grade }, { transaction });
        } else {
          insertedExams += 1;
        }
      }

      return {
        studentId: student.id,
        inserted: {
          todos: insertedTodos,
          assignments: insertedAssignments,
          exams: insertedExams,
        },
      };
    });
  }

  async getDashboard(studentId?: string): Promise<DashboardResponse> {
    const resolvedStudentId = await this.resolveStudentId(studentId);

    if (!resolvedStudentId) {
      return {
        todos: [],
        assignments: [],
        upcomingEvents: [],
        coursesSummary: [],
      };
    }

    const [generalTasks, studentSemesterCourses] = await Promise.all([
      this.generalTaskModel.findAll({
        where: { studentId: resolvedStudentId },
        order: [["dueDate", "ASC"]],
      }),
      this.studentSemesterCourseModel.findAll({
        where: { studentId: resolvedStudentId },
        include: [
          {
            model: SemesterCourse,
            include: [Course, Semester],
          },
        ],
      }),
    ]);

    const studentSemesterCourseIds = studentSemesterCourses.map((item) => item.id);

    const [assignments, exams] = await Promise.all([
      studentSemesterCourseIds.length
        ? this.assignmentModel.findAll({
            where: { studentSemesterCourseId: studentSemesterCourseIds },
            order: [["deadline", "ASC"]],
          })
        : Promise.resolve([]),
      studentSemesterCourseIds.length
        ? this.examModel.findAll({
            where: { studentSemesterCourseId: studentSemesterCourseIds },
            order: [["date", "ASC"]],
          })
        : Promise.resolve([]),
    ]);

    const contextByStudentSemesterCourseId = new Map(
      studentSemesterCourses.map((item) => {
        const semesterCourse = item.semesterCourse;
        const courseTitle = semesterCourse?.course?.title ?? "";
        const courseId = semesterCourse?.course?.id ?? "";
        const semesterNumber = semesterCourse?.semester?.semesterNumber;
        const yearNumber = semesterCourse?.semester?.yearNumber;
        const semesterLabel =
          semesterNumber && yearNumber
            ? `סמסטר ${semesterNumber} / ${yearNumber}`
            : "";

        return [
          item.id,
          {
            courseTitle,
            courseId,
            semesterLabel,
          },
        ] as const;
      })
    );

    const todos = generalTasks.map((task) => ({
      id: task.id,
      title: task.description,
      dueDate: task.dueDate.toISOString(),
      done: task.done ?? false,
      estimatedTime: {
        value: task.estimatedTimeValue ?? 30,
        unit: this.parseDurationUnit(task.estimatedTimeUnit),
      },
    }));

    const assignmentsForHome = assignments.map((assignment) => {
      const context = contextByStudentSemesterCourseId.get(
        assignment.studentSemesterCourseId
      );

      return {
        id: assignment.id,
        status: this.parseAssignmentStatus(assignment.status),
        course: context?.courseTitle || "ללא קורס",
        title: assignment.description,
        dueDate: assignment.deadline.toISOString(),
        type: this.parseAssignmentType(assignment.type),
      };
    });

    const upcomingEvents = [
      ...assignments.map((assignment) => {
        const context = contextByStudentSemesterCourseId.get(
          assignment.studentSemesterCourseId
        );

        return {
          id: assignment.id,
          kind: "assignment" as const,
          courseTitle: context?.courseTitle || "ללא קורס",
          description: assignment.description,
          eventDate: assignment.deadline.toISOString(),
          semesterLabel: context?.semesterLabel || "",
        };
      }),
      ...exams.map((exam) => {
        const context = contextByStudentSemesterCourseId.get(exam.studentSemesterCourseId);

        return {
          id: exam.id,
          kind: "exam" as const,
          courseTitle: context?.courseTitle || "ללא קורס",
          description: this.examTypeToDisplayText(exam.type),
          eventDate: exam.date.toISOString(),
          semesterLabel: context?.semesterLabel || "",
        };
      }),
    ].sort(
      (left, right) =>
        new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime()
    );

    const coursesSummary = studentSemesterCourses
      .map((item) => {
        const context = contextByStudentSemesterCourseId.get(item.id);

        if (!context || !context.courseId || !context.courseTitle) {
          return null;
        }

        return {
          id: item.id,
          studentSemesterCourseId: item.id,
          courseId: context.courseId,
          courseTitle: context.courseTitle,
          semesterLabel: context.semesterLabel,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((left, right) => left.courseTitle.localeCompare(right.courseTitle, "he"));

    return {
      todos,
      assignments: assignmentsForHome,
      upcomingEvents,
      coursesSummary,
    };
  }

  private async resolveStudentId(studentId?: string): Promise<string | null> {
    if (studentId) {
      const student = await this.studentModel.findByPk(studentId);
      return student ? student.id : null;
    }

    const firstStudent = await this.studentModel.findOne({
      order: [["createdAt", "ASC"]],
    });

    return firstStudent ? firstStudent.id : null;
  }

  private examTypeToDisplayText(type: number): string {
    switch (type) {
      case 1:
        return "מבחן";
      case 2:
        return "מועד ב'";
      default:
        return "בחינה";
    }
  }

  private parseDurationUnit(value: string | null | undefined): DurationUnit {
    return DURATION_UNITS.includes(value as DurationUnit)
      ? (value as DurationUnit)
      : "minutes";
  }

  private parseAssignmentStatus(
    value: string | null | undefined
  ): AssignmentStatus {
    if (ASSIGNMENT_STATUSES.includes(value as AssignmentStatus)) {
      return value as AssignmentStatus;
    }

    return "not started";
  }

  private parseAssignmentType(value: string | null | undefined): AssignmentType {
    if (ASSIGNMENT_TYPES.includes(value as AssignmentType)) {
      return value as AssignmentType;
    }

    return "homework";
  }

  private async findOrCreateSeedStudent(
    transaction: Transaction
  ): Promise<Student> {
    const existingStudent = await this.studentModel.findOne({
      order: [["createdAt", "ASC"]],
      transaction,
    });

    if (existingStudent) {
      return existingStudent;
    }

    const [user] = await this.userModel.findOrCreate({
      where: { username: "demo-seed-user" },
      defaults: {
        username: "demo-seed-user",
        password: "placeholder",
      },
      transaction,
    });

    return this.studentModel.create(
      {
        userId: user.id,
        coursesPerSemester: 4,
        studyType: "מכללה",
        faculty: "מדמ״ח",
        workStatus: "לא",
        studyAvailabilityDays: ["ראשון", "שלישי", "חמישי"],
        realisticStudyHoursPerDay: 2,
        focusTime: "בוקר",
        preferredStudyDuration: "25",
        strongTopics: "math",
        challengingTopics: "physics",
        semesterFocusGoal: "שיפור ציונים",
      },
      { transaction }
    );
  }

  private async findOrCreateSemester(
    yearNumber: number,
    semesterNumber: number,
    transaction: Transaction
  ): Promise<Semester> {
    const [semester] = await this.semesterModel.findOrCreate({
      where: { yearNumber, semesterNumber },
      defaults: { yearNumber, semesterNumber },
      transaction,
    });

    return semester;
  }

  private async findOrCreateDegree(
    title: string,
    type: number,
    transaction: Transaction
  ): Promise<Degree> {
    const [degree] = await this.degreeModel.findOrCreate({
      where: { title },
      defaults: { title, type, duration: 3 },
      transaction,
    });

    return degree;
  }

  private async findOrCreateCourse(
    title: string,
    degreeId: string,
    transaction: Transaction
  ): Promise<Course> {
    const existingCourse = await this.courseModel.findOne({
      where: { title },
      transaction,
    });

    if (existingCourse) {
      return existingCourse;
    }

    return this.courseModel.create(
      {
        title,
        degreeId,
      },
      { transaction }
    );
  }

  private async findOrCreateSemesterCourse(
    semesterId: string,
    courseId: string,
    transaction: Transaction
  ): Promise<SemesterCourse> {
    const [semesterCourse] = await this.semesterCourseModel.findOrCreate({
      where: { semesterId, courseId },
      defaults: { semesterId, courseId },
      transaction,
    });

    return semesterCourse;
  }

  private async findOrCreateStudentSemesterCourse(
    studentId: string,
    semesterCourseId: string,
    transaction: Transaction
  ): Promise<StudentSemesterCourse> {
    const [studentSemesterCourse] = await this.studentSemesterCourseModel.findOrCreate(
      {
        where: { studentId, semesterCourseId },
        defaults: { studentId, semesterCourseId, grade: null },
        transaction,
      }
    );

    return studentSemesterCourse;
  }
}
