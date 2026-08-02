import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { Transaction } from "sequelize";
import { Assignment } from "../assignments/assignment.model";
import { AssignmentsService } from "../assignments/assignments.service";
import { Course } from "../courses/courses.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { ExamsService } from "../exams/exams.service";
import { GeneralTask } from "../general-tasks/general-task.model";
import { GeneralTasksService } from "../general-tasks/general-tasks.service";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { StudentSemesterCoursesService } from "../student-semester-courses/student-semester-courses.service";
import { Student } from "../students/student.model";
import { UpcomingEventsTypesEnum } from "../types";
import { User } from "../users/user.model";

const DURATION_UNITS = ["minutes", "hours", "days"] as const;
type DurationUnit = (typeof DURATION_UNITS)[number];

const ASSIGNMENT_STATUSES = ["not started", "active", "done"] as const;
type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

const ASSIGNMENT_TYPES = [
  "assignment",
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
    kind: UpcomingEventsTypesEnum;
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

export type CreateTaskPayload = {
  title: string;
  dueDate: string;
  estimatedTimeValue: number;
  estimatedTimeUnit?: DurationUnit;
};

export type CreateAssignmentPayload = {
  course: string;
  title: string;
  dueDate: string;
  status?: AssignmentStatus;
  type?: AssignmentType;
};

export type CreateUpcomingEventPayload = {
  kind: "assignment" | "exam";
  courseTitle: string;
  description: string;
  eventDate: string;
  semesterLabel?: string;
};

export type CreateCourseSummaryPayload = {
  courseTitle: string;
  semesterLabel?: string;
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
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse,
    private readonly generalTasksService: GeneralTasksService,
    private readonly assignmentsService: AssignmentsService,
    private readonly examsService: ExamsService,
    private readonly studentSemesterCoursesService: StudentSemesterCoursesService
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
        { title: "אלגברה לינארית", degreeTitle: "מדעי המחשב", credits: 3 },
        { title: "מבני נתונים", degreeTitle: "הנדסת תוכנה", credits: 4 },
        { title: "מסדי נתונים", degreeTitle: "מערכות מידע", credits: 3 },
        { title: "סטטיסטיקה", degreeTitle: "מדעי הנתונים", credits: 2 },
      ];

      const studentSemesterCourseByTitle = new Map<
        string,
        StudentSemesterCourse
      >();

      for (const [index, courseSeed] of courses.entries()) {
        const degree = await this.findOrCreateDegree(
          courseSeed.degreeTitle,
          index + 1,
          transaction
        );

        const course = await this.findOrCreateCourse(
          courseSeed.title,
          degree.id,
          courseSeed.credits,
          transaction
        );

        const semesterCourse = await this.findOrCreateSemesterCourse(
          semester.id,
          course.id,
          transaction
        );

        const studentSemesterCourse =
          await this.findOrCreateStudentSemesterCourse(
            student.id,
            semesterCourse.id,
            transaction
          );

        studentSemesterCourseByTitle.set(
          courseSeed.title,
          studentSemesterCourse
        );
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

  async getDashboard(studentId: string): Promise<DashboardResponse> {
    const orderedFormattedGeneralTasksByStudentId =
      await this.generalTasksService.getOrderedFormattedGeneralTasksByStudentId(
        studentId
      );

    const orderedFormattedAssignmentsByStudentId =
      await this.assignmentsService.getOrderedFormattedAssignmentsByStudentId(
        studentId
      );

    const oredredFormattedExamsByStudentdId =
      await this.examsService.getOredredFormattedExamsByStudentdId(studentId);

    const orderedFormattedCoursesByStudentId =
      await this.studentSemesterCoursesService.getOrderedFormattedCoursesByStudentId(
        studentId
      );

    return {
      todos: orderedFormattedGeneralTasksByStudentId,
      assignments: orderedFormattedAssignmentsByStudentId,
      upcomingEvents: oredredFormattedExamsByStudentdId,
      coursesSummary: orderedFormattedCoursesByStudentId,
    };
  }

  async createTask(payload: CreateTaskPayload, studentId: string) {
    const sequelize = this.studentModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const student = await this.getStudentById(studentId, transaction);

      const estimatedTimeUnit = this.parseDurationUnit(
        payload.estimatedTimeUnit
      );

      const task = await this.generalTaskModel.create(
        {
          studentId: student.id,
          description: payload.title,
          dueDate: this.parseDate(payload.dueDate),
          done: false,
          estimatedTimeValue: Math.max(
            1,
            Math.round(payload.estimatedTimeValue)
          ),
          estimatedTimeUnit,
        },
        { transaction }
      );

      return { id: task.id };
    });
  }

  async createAssignment(payload: CreateAssignmentPayload, studentId: string) {
    const sequelize = this.studentModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const student = await this.getStudentById(studentId, transaction);

      const studentSemesterCourse =
        await this.findOrCreateStudentSemesterCourseForCourseTitle(
          student.id,
          payload.course,
          undefined,
          transaction
        );

      const assignment = await this.assignmentModel.create(
        {
          studentSemesterCourseId: studentSemesterCourse.id,
          description: payload.title,
          deadline: this.parseDate(payload.dueDate),
          status: this.parseAssignmentStatus(payload.status),
          type: this.parseAssignmentType(payload.type),
          grade: null,
        },
        { transaction }
      );

      return { id: assignment.id };
    });
  }

  async createUpcomingEvent(
    payload: CreateUpcomingEventPayload,
    studentId: string
  ) {
    const sequelize = this.studentModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const student = await this.getStudentById(studentId, transaction);

      const studentSemesterCourse =
        await this.findOrCreateStudentSemesterCourseForCourseTitle(
          student.id,
          payload.courseTitle,
          payload.semesterLabel,
          transaction
        );

      if (payload.kind === "assignment") {
        const assignment = await this.assignmentModel.create(
          {
            studentSemesterCourseId: studentSemesterCourse.id,
            description: payload.description,
            deadline: this.parseDate(payload.eventDate),
            status: "not started",
            type: "homework",
            grade: null,
          },
          { transaction }
        );

        return { id: assignment.id, kind: "assignment" as const };
      }

      const exam = await this.examModel.create(
        {
          studentSemesterCourseId: studentSemesterCourse.id,
          date: this.parseDate(payload.eventDate),
          type: payload.description.includes("ב") ? 2 : 1,
          grade: null,
        },
        { transaction }
      );

      return { id: exam.id, kind: "exam" as const };
    });
  }

  async createCourseSummaryItem(
    payload: CreateCourseSummaryPayload,
    studentId: string
  ) {
    const sequelize = this.studentModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const student = await this.getStudentById(studentId, transaction);

      const studentSemesterCourse =
        await this.findOrCreateStudentSemesterCourseForCourseTitle(
          student.id,
          payload.courseTitle,
          payload.semesterLabel,
          transaction
        );

      return { id: studentSemesterCourse.id };
    });
  }

  private async getStudentById(
    studentId: string,
    transaction: Transaction
  ): Promise<Student> {
    const student = await this.studentModel.findByPk(studentId, {
      transaction,
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }

  private parseDate(value: string | undefined): Date {
    const parsed = value ? new Date(value) : new Date();

    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
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

  private parseAssignmentType(
    value: string | null | undefined
  ): AssignmentType {
    if (ASSIGNMENT_TYPES.includes(value as AssignmentType)) {
      return value as AssignmentType;
    }

    return "homework";
  }

  private parseSemesterLabel(value: string | undefined): {
    yearNumber: number;
    semesterNumber: number;
  } {
    const currentYear = new Date().getFullYear();

    if (!value) {
      return { yearNumber: currentYear, semesterNumber: 1 };
    }

    const yearMatch = value.match(/(20\d{2})/);
    const semesterMatch = value.match(/([12אב])/);

    const yearNumber = yearMatch ? Number(yearMatch[1]) : currentYear;
    let semesterNumber = 1;

    if (semesterMatch) {
      const parsedValue = semesterMatch[1];
      semesterNumber = parsedValue === "2" || parsedValue === "ב" ? 2 : 1;
    }

    return { yearNumber, semesterNumber };
  }

  private async findOrCreateStudentSemesterCourseForCourseTitle(
    studentId: string,
    courseTitle: string,
    semesterLabel: string | undefined,
    transaction: Transaction
  ): Promise<StudentSemesterCourse> {
    const normalizedCourseTitle = (courseTitle || "קורס חדש").trim();

    const existingStudentSemesterCourse =
      await this.studentSemesterCourseModel.findOne({
        where: { studentId },
        include: [
          {
            model: SemesterCourse,
            required: true,
            include: [
              {
                model: Course,
                required: true,
                where: { title: normalizedCourseTitle },
              },
            ],
          },
        ],
        transaction,
      });

    if (existingStudentSemesterCourse) {
      return existingStudentSemesterCourse;
    }

    const { yearNumber, semesterNumber } =
      this.parseSemesterLabel(semesterLabel);

    const semester = await this.findOrCreateSemester(
      yearNumber,
      semesterNumber,
      transaction
    );

    const degree = await this.findOrCreateDegree(
      `מסלול ${normalizedCourseTitle}`,
      1,
      transaction
    );

    const course = await this.findOrCreateCourse(
      normalizedCourseTitle,
      degree.id,
      3,
      transaction
    );

    const semesterCourse = await this.findOrCreateSemesterCourse(
      semester.id,
      course.id,
      transaction
    );

    return this.findOrCreateStudentSemesterCourse(
      studentId,
      semesterCourse.id,
      transaction
    );
  }

  private async findOrCreateSeedStudent(
    transaction: Transaction
  ): Promise<Student> {
    const preferredUser = await this.userModel.findOne({
      where: { username: "demo-user" },
      transaction,
    });

    if (preferredUser) {
      const preferredStudent = await this.studentModel.findOne({
        where: { userId: preferredUser.id },
        transaction,
      });

      if (preferredStudent) {
        return preferredStudent;
      }
    }

    const existingStudent = await this.studentModel.findOne({
      order: [["createdAt", "ASC"]],
      transaction,
    });

    if (existingStudent) {
      return existingStudent;
    }

    const [user] = await this.userModel.findOrCreate({
      where: { username: "demo-user" },
      defaults: {
        username: "demo-user",
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
    credits: number,
    transaction: Transaction
  ): Promise<Course> {
    const existingCourse = await this.courseModel.findOne({
      where: { title },
      transaction,
    });

    if (existingCourse) {
      if (existingCourse.credits !== credits) {
        await existingCourse.update({ credits }, { transaction });
      }

      return existingCourse;
    }

    return this.courseModel.create(
      {
        title,
        degreeId,
        credits,
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
    const [studentSemesterCourse] =
      await this.studentSemesterCourseModel.findOrCreate({
        where: { studentId, semesterCourseId },
        defaults: { studentId, semesterCourseId, grade: null },
        transaction,
      });

    return studentSemesterCourse;
  }
}
