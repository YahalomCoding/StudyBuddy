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
  semesterNumber?: number;
};

export type CreateCourseSummaryPayload = {
  courseTitle: string;
  semesterNumber?: number;
  credits?: number;
};

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(Student) private readonly studentModel: typeof Student,
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
          payload.semesterNumber,
          undefined,
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
          payload.semesterNumber,
          payload.credits,
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

  private parseSemesterNumber(value: number | undefined): {
    yearNumber: number;
    semesterNumber: number;
  } {
    const currentYear = new Date().getFullYear();
    const semesterNumber =
      value === 1 || value === 2 || value === 3 ? value : 1;
    return { yearNumber: currentYear, semesterNumber };
  }

  private async findOrCreateStudentSemesterCourseForCourseTitle(
    studentId: string,
    courseTitle: string,
    semesterNumber: number | undefined,
    credits: number | undefined,
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

    const { yearNumber, semesterNumber: resolvedSemesterNumber } =
      this.parseSemesterNumber(semesterNumber);

    const semester = await this.findOrCreateSemester(
      yearNumber,
      resolvedSemesterNumber,
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
      typeof credits === "number" && credits > 0 ? credits : 3,
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
