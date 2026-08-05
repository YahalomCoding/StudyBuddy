import { Injectable } from "@nestjs/common";
import { OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/courses.model";
import { Exam } from "../exams/exam.model";
import { GeneralTask } from "../general-tasks/general-task.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { encode as encodeToon } from "./toon/toon";

const toolDefinitions = import("@studybuddy/tool-definitions");

type ChatToolsContext = {
  userId: string;
  studentId: string;
};

@Injectable()
export class ToolsService implements OnModuleInit {
  constructor(
    @InjectModel(Student) private readonly studentModel: typeof Student,
    @InjectModel(GeneralTask)
    private readonly generalTaskModel: typeof GeneralTask,
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,
    @InjectModel(Exam) private readonly examModel: typeof Exam,
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse
  ) {}

  private toolDefinitions!: Awaited<typeof toolDefinitions>;

  async onModuleInit() {
    // Preload the tool definitions to avoid delays on first use
    this.toolDefinitions = await toolDefinitions;
  }

  getCurrentTimeTool() {
    return this.toolDefinitions.getCurrentTimeServerDef.server(() => {
      const now = new Date();
      return this.encodeToolPayload({
        iso: now.toISOString(),
        date: now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    });
  }

  getChatTools(context: ChatToolsContext) {
    return [
      this.getCurrentTimeTool(),
      this.getUserProfileTool(context),
      this.getStudentCoursesTool(context),
      this.getStudentTasksTool(context),
      this.getStudentAssignmentsTool(context),
      this.getStudentExamsTool(context),
      this.getStudentAcademicOverviewTool(context),
    ];
  }

  private getUserProfileTool(context: ChatToolsContext) {
    return this.toolDefinitions.getUserProfileServerDef.server(async () => {
      const student = await this.studentModel.findOne({
        where: { id: context.studentId, userId: context.userId },
        attributes: [
          "id",
          "userId",
          "coursesPerSemester",
          "studyType",
          "faculty",
          "workStatus",
          "studyAvailabilityDays",
          "realisticStudyHoursPerDay",
          "focusTime",
          "preferredStudyDuration",
          "strongTopics",
          "challengingTopics",
          "semesterFocusGoal",
        ],
      });

      if (!student) {
        return this.encodeToolPayload({
          found: false,
          student: null,
        });
      }

      return this.encodeToolPayload({
        found: true,
        student: {
          id: student.id,
          userId: student.userId,
          coursesPerSemester: student.coursesPerSemester,
          studyType: student.studyType,
          faculty: student.faculty,
          workStatus: student.workStatus,
          studyAvailabilityDays: student.studyAvailabilityDays,
          realisticStudyHoursPerDay: student.realisticStudyHoursPerDay,
          focusTime: student.focusTime,
          preferredStudyDuration: student.preferredStudyDuration,
          strongTopics: student.strongTopics,
          challengingTopics: student.challengingTopics,
          semesterFocusGoal: student.semesterFocusGoal,
        },
      });
    });
  }

  private getStudentCoursesTool(context: ChatToolsContext) {
    return this.toolDefinitions.getStudentCoursesServerDef.server(
      async (input) => {
        const parsedInput =
          this.toolDefinitions.getStudentCoursesInputSchema.parse(input);
        const limit = this.resolveLimit(parsedInput.limit);
        const studentCourses = await this.studentSemesterCourseModel.findAll({
          where: { studentId: context.studentId },
          attributes: ["id", "semesterCourseId"],
          include: [
            {
              model: SemesterCourse,
              required: true,
              attributes: ["id", "courseId"],
              include: [
                { model: Course, required: true, attributes: ["id", "title"] },
              ],
            },
          ],
          order: [["createdAt", "ASC"]],
          limit,
        });

        const courses = studentCourses.map((studentCourse) => ({
          studentSemesterCourseId: studentCourse.id,
          semesterCourseId: studentCourse.semesterCourse.id,
          courseId: studentCourse.semesterCourse.course.id,
          title: studentCourse.semesterCourse.course.title,
        }));

        return this.encodeToolPayload({
          count: courses.length,
          courses,
        });
      }
    );
  }

  private getStudentTasksTool(context: ChatToolsContext) {
    return this.toolDefinitions.getStudentTasksServerDef.server(
      async (input) => {
        const parsedInput =
          this.toolDefinitions.getStudentTasksInputSchema.parse(input);
        const limit = this.resolveLimit(parsedInput.limit);
        const taskStatus = parsedInput.status ?? "open";
        const where: Record<string, unknown> = { studentId: context.studentId };

        if (taskStatus === "open") {
          where.done = false;
        }

        if (taskStatus === "done") {
          where.done = true;
        }

        const tasks = await this.generalTaskModel.findAll({
          where,
          attributes: [
            "id",
            "description",
            "dueDate",
            "done",
            "estimatedTimeValue",
            "estimatedTimeUnit",
          ],
          include: [
            {
              model: SemesterCourse,
              required: false,
              attributes: ["id", "courseId"],
              include: [
                { model: Course, required: false, attributes: ["id", "title"] },
              ],
            },
          ],
          order: [["dueDate", "ASC"]],
          limit,
        });

        return this.encodeToolPayload({
          count: tasks.length,
          tasks: tasks.map((task) => ({
            id: task.id,
            description: task.description,
            dueDate: task.dueDate.toISOString(),
            done: task.done,
            estimatedTimeValue: task.estimatedTimeValue,
            estimatedTimeUnit: task.estimatedTimeUnit,
            courseTitle: task.semesterCourse?.course?.title ?? null,
          })),
        });
      }
    );
  }

  private getStudentAssignmentsTool(context: ChatToolsContext) {
    return this.toolDefinitions.getStudentAssignmentsServerDef.server(
      async (input) => {
        const parsedInput =
          this.toolDefinitions.getStudentAssignmentsInputSchema.parse(input);
        const limit = this.resolveLimit(parsedInput.limit);
        const status = parsedInput.status ?? "open";
        const where: Record<string, unknown> = {};

        if (status === "open") {
          where.status = ["not started", "active"];
        }

        if (status === "done") {
          where.status = ["done"];
        }

        const assignments = await this.assignmentModel.findAll({
          where,
          attributes: [
            "id",
            "description",
            "deadline",
            "status",
            "type",
            "grade",
          ],
          include: [
            {
              model: StudentSemesterCourse,
              required: true,
              attributes: ["id", "studentId"],
              where: { studentId: context.studentId },
              include: [
                {
                  model: SemesterCourse,
                  required: true,
                  attributes: ["id", "courseId"],
                  include: [
                    {
                      model: Course,
                      required: true,
                      attributes: ["id", "title"],
                    },
                  ],
                },
              ],
            },
          ],
          order: [["deadline", "ASC"]],
          limit,
        });

        return this.encodeToolPayload({
          count: assignments.length,
          assignments: assignments.map((assignment) => ({
            id: assignment.id,
            description: assignment.description,
            deadline: assignment.deadline.toISOString(),
            status: assignment.status,
            type: assignment.type,
            grade: assignment.grade,
            courseTitle:
              assignment.studentSemesterCourse.semesterCourse.course.title,
          })),
        });
      }
    );
  }

  private getStudentExamsTool(context: ChatToolsContext) {
    return this.toolDefinitions.getStudentExamsServerDef.server(
      async (input) => {
        const now = new Date();
        const parsedInput =
          this.toolDefinitions.getStudentExamsInputSchema.parse(input);
        const limit = this.resolveLimit(parsedInput.limit);
        const upcomingOnly = parsedInput.upcomingOnly ?? true;
        const where: Record<string, unknown> = {};
        const dateFilter: Record<symbol, Date> = {};

        if (upcomingOnly) {
          dateFilter[Op.gte] = now;
        }

        if (parsedInput.fromDate) {
          const fromDate = new Date(parsedInput.fromDate);
          if (!Number.isNaN(fromDate.getTime())) {
            dateFilter[Op.gte] = fromDate;
          }
        }

        if (parsedInput.toDate) {
          const toDate = new Date(parsedInput.toDate);
          if (!Number.isNaN(toDate.getTime())) {
            dateFilter[Op.lte] = toDate;
          }
        }

        if (
          Object.keys(dateFilter).length > 0 ||
          Object.getOwnPropertySymbols(dateFilter).length > 0
        ) {
          where.date = dateFilter;
        }

        const exams = await this.examModel.findAll({
          where,
          attributes: ["id", "date", "type", "grade"],
          include: [
            {
              model: StudentSemesterCourse,
              required: true,
              attributes: ["id", "studentId"],
              where: { studentId: context.studentId },
              include: [
                {
                  model: SemesterCourse,
                  required: true,
                  attributes: ["id", "courseId"],
                  include: [
                    {
                      model: Course,
                      required: true,
                      attributes: ["id", "title"],
                    },
                  ],
                },
              ],
            },
          ],
          order: [["date", "ASC"]],
          limit,
        });

        return this.encodeToolPayload({
          count: exams.length,
          exams: exams.map((exam) => ({
            id: exam.id,
            date: exam.date.toISOString(),
            type: exam.type,
            grade: exam.grade,
            courseTitle: exam.studentSemesterCourse.semesterCourse.course.title,
          })),
        });
      }
    );
  }

  private getStudentAcademicOverviewTool(context: ChatToolsContext) {
    return this.toolDefinitions.getStudentAcademicOverviewServerDef.server(
      async () => {
        const [
          courses,
          openTasks,
          openAssignments,
          upcomingExams,
          nextTask,
          nextAssignment,
          nextExam,
        ] = await Promise.all([
          this.studentSemesterCourseModel.count({
            where: { studentId: context.studentId },
          }),
          this.generalTaskModel.count({
            where: { studentId: context.studentId, done: false },
          }),
          this.assignmentModel.count({
            where: { status: ["not started", "active"] },
            include: [
              {
                model: StudentSemesterCourse,
                required: true,
                where: { studentId: context.studentId },
              },
            ],
          }),
          this.examModel.count({
            where: { date: { [Op.gte]: new Date() } },
            include: [
              {
                model: StudentSemesterCourse,
                required: true,
                where: { studentId: context.studentId },
              },
            ],
          }),
          this.generalTaskModel.findOne({
            where: { studentId: context.studentId, done: false },
            attributes: ["id", "description", "dueDate"],
            order: [["dueDate", "ASC"]],
          }),
          this.assignmentModel.findOne({
            where: { status: ["not started", "active"] },
            attributes: ["id", "description", "deadline"],
            include: [
              {
                model: StudentSemesterCourse,
                required: true,
                attributes: ["id", "studentId"],
                where: { studentId: context.studentId },
                include: [
                  {
                    model: SemesterCourse,
                    required: true,
                    attributes: ["id", "courseId"],
                    include: [
                      {
                        model: Course,
                        required: true,
                        attributes: ["id", "title"],
                      },
                    ],
                  },
                ],
              },
            ],
            order: [["deadline", "ASC"]],
          }),
          this.examModel.findOne({
            where: { date: { [Op.gte]: new Date() } },
            attributes: ["id", "date", "type"],
            include: [
              {
                model: StudentSemesterCourse,
                required: true,
                attributes: ["id", "studentId"],
                where: { studentId: context.studentId },
                include: [
                  {
                    model: SemesterCourse,
                    required: true,
                    attributes: ["id", "courseId"],
                    include: [
                      {
                        model: Course,
                        required: true,
                        attributes: ["id", "title"],
                      },
                    ],
                  },
                ],
              },
            ],
            order: [["date", "ASC"]],
          }),
        ]);

        return this.encodeToolPayload({
          counts: {
            courses,
            openTasks,
            openAssignments,
            upcomingExams,
          },
          nextDeadlines: {
            task: nextTask
              ? {
                  id: nextTask.id,
                  description: nextTask.description,
                  dueDate: nextTask.dueDate.toISOString(),
                }
              : null,
            assignment: nextAssignment
              ? {
                  id: nextAssignment.id,
                  description: nextAssignment.description,
                  deadline: nextAssignment.deadline.toISOString(),
                  courseTitle:
                    nextAssignment.studentSemesterCourse.semesterCourse.course
                      .title,
                }
              : null,
            exam: nextExam
              ? {
                  id: nextExam.id,
                  date: nextExam.date.toISOString(),
                  type: nextExam.type,
                  courseTitle:
                    nextExam.studentSemesterCourse.semesterCourse.course.title,
                }
              : null,
          },
        });
      }
    );
  }

  private encodeToolPayload(payload: unknown) {
    return encodeToon(payload, { indent: 0, keyFolding: "safe" });
  }

  private resolveLimit(inputLimit: number | undefined) {
    if (!inputLimit) {
      return 12;
    }

    return Math.max(1, Math.min(50, Math.trunc(inputLimit)));
  }
}
