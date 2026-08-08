import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import {
  assignmentGenerationResultSchema,
  type AssignmentGenerationResult,
} from "@studybuddy/schemas";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/courses.model";
import { Exam } from "../exams/exam.model";
import { GeneralTask } from "../general-tasks/general-task.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { AI_FEATURE_SYSTEM_PROMPTS } from "./ai-feature-prompts";
import { encode as encodeToon } from "./toon/toon";
import { getSystemPrompt, loadAiChat } from "./ai.utils";
import { createLangfuseMiddleware } from "./langfuse.middleware";

const NORMALIZED_ASSIGNMENT_TYPES = new Set([
  "homework",
  "practice",
  "project",
  "report",
  "lab",
]);

const FEATURE_PROMPT_NAMES = {
  studyPlan: "studybuddy-study-plan",
  deadlineInsights: "studybuddy-deadline-insights",
  assignmentGeneration: "studybuddy-ai-feature-assignment-generation",
} as const;

const FEATURE_REASONING_EFFORT: "low" | "none" = "none";

const normalizeCourseKey = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

@Injectable()
export class AiFeaturesService {
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

  async streamStudyPlan(studentId: string, traceUserId: string) {
    const profile = await this.getPlanningProfile(studentId);
    const prompt = this.buildStudyPlanPrompt(profile);
    const systemPrompt = await getSystemPrompt(FEATURE_PROMPT_NAMES.studyPlan);

    return this.streamMarkdown({
      systemPrompt: systemPrompt.prompt,
      userPrompt: prompt,
      traceUserId,
      promptName: systemPrompt.promptName,
      promptVersion: systemPrompt.version,
      generationTag: "study-plan",
    });
  }

  async streamDeadlineInsights(studentId: string, traceUserId: string) {
    const profile = await this.getPlanningProfile(studentId);
    const prompt = this.buildDeadlineInsightsPrompt(profile);
    const systemPrompt = await getSystemPrompt(
      FEATURE_PROMPT_NAMES.deadlineInsights
    );

    return this.streamMarkdown({
      systemPrompt: systemPrompt.prompt,
      userPrompt: prompt,
      traceUserId,
      promptName: systemPrompt.promptName,
      promptVersion: systemPrompt.version,
      generationTag: "deadline-insights",
    });
  }

  async generateAssignmentsAndSubtasks(studentId: string, traceUserId: string) {
    const profile = await this.getPlanningProfile(studentId);
    const prompt = this.buildAssignmentGenerationPrompt(profile);

    const { chat, aiTextProviderAdapter } = await loadAiChat();

    const modelResult = await chat({
      adapter: aiTextProviderAdapter,
      stream: false,
      modelOptions: {
        includeReasoning: true,
        reasoning: {
          effort: FEATURE_REASONING_EFFORT,
        },
      },
      systemPrompts: [AI_FEATURE_SYSTEM_PROMPTS.assignmentGeneration],
      messages: [{ role: "user", content: prompt }],
      outputSchema: assignmentGenerationResultSchema,
      middleware: [
        createLangfuseMiddleware({
          userId: traceUserId,
          tags: ["ai-feature", "assignment-generation"],
          promptName: FEATURE_PROMPT_NAMES.assignmentGeneration,
          systemPrompts: [AI_FEATURE_SYSTEM_PROMPTS.assignmentGeneration],
        }),
      ],
    });

    const parsed = assignmentGenerationResultSchema.safeParse(modelResult);

    if (!parsed.success) {
      throw new Error("Invalid model output for assignment generation");
    }

    return this.persistAssignmentGeneration(studentId, parsed.data);
  }

  private async streamMarkdown({
    systemPrompt,
    userPrompt,
    traceUserId,
    promptName,
    promptVersion,
    generationTag,
  }: {
    systemPrompt: string;
    userPrompt: string;
    traceUserId: string;
    promptName: string;
    promptVersion?: number;
    generationTag: string;
  }) {
    const { chat, aiTextProviderAdapter } = await loadAiChat();

    return chat({
      adapter: aiTextProviderAdapter,
      stream: true,
      modelOptions: {
        includeReasoning: true,
        reasoning: {
          effort: FEATURE_REASONING_EFFORT,
        },
      },
      systemPrompts: [systemPrompt],
      messages: [{ role: "user", content: userPrompt }],
      middleware: [
        createLangfuseMiddleware({
          userId: traceUserId,
          tags: ["ai-feature", generationTag],
          promptName,
          promptVersion,
        }),
      ],
    });
  }

  private limitItems<T>(items: T[], maxItems: number) {
    return items.slice(0, maxItems);
  }

  private compact(value: string) {
    return value
      .replace(/[\r\n]+/g, " ")
      .replace(/[|]/g, "/")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  private async getPlanningProfile(studentId: string) {
    const student = await this.studentModel.findByPk(studentId, {
      attributes: [
        "id",
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
      throw new Error("Student not found");
    }

    const [openTasks, openAssignments, exams, studentCourses] =
      await Promise.all([
        this.generalTaskModel.findAll({
          where: { studentId, done: false },
          attributes: [
            "id",
            "description",
            "dueDate",
            "estimatedTimeValue",
            "estimatedTimeUnit",
          ],
          order: [["dueDate", "ASC"]],
        }),
        this.assignmentModel.findAll({
          include: [
            {
              model: StudentSemesterCourse,
              required: true,
              attributes: ["id", "studentId"],
              where: { studentId },
              include: [
                {
                  model: SemesterCourse,
                  required: true,
                  attributes: ["id"],
                  include: [
                    { model: Course, required: true, attributes: ["title"] },
                  ],
                },
              ],
            },
          ],
          attributes: ["id", "description", "deadline", "status", "type"],
          where: { status: ["not started", "active"] },
          order: [["deadline", "ASC"]],
        }),
        this.examModel.findAll({
          include: [
            {
              model: StudentSemesterCourse,
              required: true,
              attributes: ["studentId"],
              where: { studentId },
              include: [
                {
                  model: SemesterCourse,
                  required: true,
                  attributes: ["id"],
                  include: [
                    { model: Course, required: true, attributes: ["title"] },
                  ],
                },
              ],
            },
          ],
          attributes: ["id", "date", "type"],
          order: [["date", "ASC"]],
        }),
        this.studentSemesterCourseModel.findAll({
          where: { studentId },
          attributes: ["id", "semesterCourseId"],
          include: [
            {
              model: SemesterCourse,
              required: true,
              attributes: ["id"],
              include: [
                { model: Course, required: true, attributes: ["title"] },
              ],
            },
          ],
        }),
      ]);

    const courseMap = new Map(
      studentCourses.map((courseLink) => [
        normalizeCourseKey(courseLink.semesterCourse.course.title),
        {
          studentSemesterCourseId: courseLink.id,
          semesterCourseId: courseLink.semesterCourseId,
          title: courseLink.semesterCourse.course.title,
        },
      ])
    );

    const tasksForSplit = openTasks
      .filter((task) => task.estimatedTimeValue >= 60)
      .map((task) => ({
        title: task.description,
        dueDate: task.dueDate.toISOString(),
        estimatedTimeValue: task.estimatedTimeValue,
        estimatedTimeUnit: task.estimatedTimeUnit,
      }));

    return {
      student: {
        studyType: student.studyType,
        faculty: student.faculty,
        workStatus: student.workStatus,
        coursesPerSemester: student.coursesPerSemester,
        studyAvailabilityDays: student.studyAvailabilityDays,
        realisticStudyHoursPerDay: student.realisticStudyHoursPerDay,
        focusTime: student.focusTime,
        preferredStudyDuration: student.preferredStudyDuration,
        strongTopics: student.strongTopics,
        challengingTopics: student.challengingTopics,
        semesterFocusGoal: student.semesterFocusGoal,
      },
      openTasks: openTasks.map((task) => ({
        title: task.description,
        dueDate: task.dueDate.toISOString(),
        estimatedTimeValue: task.estimatedTimeValue,
        estimatedTimeUnit: task.estimatedTimeUnit,
      })),
      openTasksCount: openTasks.length,
      openAssignments: openAssignments.map((assignment) => ({
        title: assignment.description,
        dueDate: assignment.deadline.toISOString(),
        status: assignment.status,
        type: assignment.type,
        courseTitle:
          assignment.studentSemesterCourse.semesterCourse.course.title,
      })),
      exams: exams.map((exam) => ({
        date: exam.date.toISOString(),
        type: exam.type,
        courseTitle: exam.studentSemesterCourse.semesterCourse.course.title,
      })),
      courses: Array.from(courseMap.values()),
      courseMap,
      tasksForSplit,
    };
  }

  private buildStudyPlanPrompt(
    profile: Awaited<ReturnType<AiFeaturesService["getPlanningProfile"]>>
  ) {
    const payload = {
      kind: "study-plan",
      student: {
        studyType: profile.student.studyType,
        workStatus: profile.student.workStatus,
        coursesPerSemester: profile.student.coursesPerSemester,
        studyAvailabilityDays: profile.student.studyAvailabilityDays,
        realisticStudyHoursPerDay: profile.student.realisticStudyHoursPerDay,
        focusTime: profile.student.focusTime,
        preferredStudyDuration: profile.student.preferredStudyDuration,
        strongTopics: this.compact(String(profile.student.strongTopics ?? "-")),
        challengingTopics: this.compact(
          String(profile.student.challengingTopics ?? "-")
        ),
        semesterFocusGoal: this.compact(profile.student.semesterFocusGoal),
      },
      assignments: this.limitItems(profile.openAssignments, 6).map(
        (assignment) => ({
          dueDate: assignment.dueDate.slice(0, 10),
          courseTitle: this.compact(assignment.courseTitle),
          type: assignment.type,
          title: this.compact(assignment.title),
        })
      ),
      tasks: this.limitItems(profile.openTasks, 8).map((task) => ({
        dueDate: task.dueDate.slice(0, 10),
        estimatedTime: `${task.estimatedTimeValue}${task.estimatedTimeUnit[0]}`,
        title: this.compact(task.title),
      })),
      exams: this.limitItems(profile.exams, 6).map((exam) => ({
        date: exam.date.slice(0, 10),
        courseTitle: this.compact(exam.courseTitle),
        type: exam.type,
      })),
    };

    const toonData = encodeToon(payload, { indent: 1, keyFolding: "safe" });

    return [
      `Today is: ${new Date().toISOString()}`,
      "Task: Produce concise markdown study plan for next 7 days.",
      "Input format: TOON.",
      "",
      toonData,
      "",
      "Only use this data. Do not restate raw input.",
    ].join("\n");
  }

  private buildDeadlineInsightsPrompt(
    profile: Awaited<ReturnType<AiFeaturesService["getPlanningProfile"]>>
  ) {
    const payload = {
      kind: "deadline-insights",
      student: {
        studyAvailabilityDays: profile.student.studyAvailabilityDays,
        realisticStudyHoursPerDay: profile.student.realisticStudyHoursPerDay,
        focusTime: profile.student.focusTime,
        preferredStudyDuration: profile.student.preferredStudyDuration,
        workStatus: profile.student.workStatus,
      },
      counts: {
        tasks: profile.openTasksCount,
        assignments: profile.openAssignments.length,
        exams: profile.exams.length,
      },
      assignments: this.limitItems(profile.openAssignments, 8).map(
        (assignment) => ({
          dueDate: assignment.dueDate.slice(0, 10),
          status: assignment.status,
          courseTitle: this.compact(assignment.courseTitle),
          title: this.compact(assignment.title),
        })
      ),
      exams: this.limitItems(profile.exams, 8).map((exam) => ({
        date: exam.date.slice(0, 10),
        courseTitle: this.compact(exam.courseTitle),
        type: exam.type,
      })),
      tasks: this.limitItems(profile.openTasks, 10).map((task) => ({
        dueDate: task.dueDate.slice(0, 10),
        estimatedTime: `${task.estimatedTimeValue}${task.estimatedTimeUnit[0]}`,
        title: this.compact(task.title),
      })),
    };

    const toonData = encodeToon(payload, { indent: 1, keyFolding: "safe" });

    return [
      `Today is: ${new Date().toISOString()}`,
      "Task: Produce concise markdown deadline-risk insights for next 7 days.",
      "Input format: TOON.",
      "",
      toonData,
      "",
      "Only use this data. Focus on risk signals and actions.",
    ].join("\n");
  }

  private buildAssignmentGenerationPrompt(
    profile: Awaited<ReturnType<AiFeaturesService["getPlanningProfile"]>>
  ) {
    const payload = {
      kind: "assignment-generation",
      student: {
        coursesPerSemester: profile.student.coursesPerSemester,
        realisticStudyHoursPerDay: profile.student.realisticStudyHoursPerDay,
        studyAvailabilityDays: profile.student.studyAvailabilityDays,
        workStatus: profile.student.workStatus,
      },
      courses: this.limitItems(profile.courses, 12).map((course) => ({
        courseTitle: this.compact(course.title),
      })),
      openAssignments: this.limitItems(profile.openAssignments, 10).map(
        (assignment) => ({
          dueDate: assignment.dueDate.slice(0, 10),
          status: assignment.status,
          courseTitle: this.compact(assignment.courseTitle),
          title: this.compact(assignment.title),
        })
      ),
      splitTasks: this.limitItems(profile.tasksForSplit, 10).map((task) => ({
        dueDate: task.dueDate.slice(0, 10),
        estimatedTime: `${task.estimatedTimeValue}${task.estimatedTimeUnit[0]}`,
        title: this.compact(task.title),
      })),
    };

    const toonData = encodeToon(payload, { indent: 1, keyFolding: "safe" });

    return [
      `Today is: ${new Date().toISOString()}`,
      "Task: Generate assignment/subtask JSON for next 1-2 weeks.",
      "Input format: TOON.",
      "",
      toonData,
      "",
      "Do not explain. Return schema-only JSON.",
    ].join("\n");
  }

  private async persistAssignmentGeneration(
    studentId: string,
    generated: AssignmentGenerationResult
  ) {
    const profile = await this.getPlanningProfile(studentId);

    const createdAssignments = [] as Assignment[];
    const createdSubtasks = [] as GeneralTask[];

    for (const generatedAssignment of generated.assignments) {
      const course = profile.courseMap.get(
        normalizeCourseKey(generatedAssignment.courseTitle)
      );

      if (!course) {
        continue;
      }

      const parsedDueDate = new Date(generatedAssignment.dueDateIso);
      const dueDate = Number.isNaN(parsedDueDate.getTime())
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : parsedDueDate;

      const normalizedType = this.normalizeAssignmentType(
        generatedAssignment.type
      );

      const created = await this.assignmentModel.create({
        studentSemesterCourseId: course.studentSemesterCourseId,
        description: generatedAssignment.title,
        deadline: dueDate,
        grade: null,
        status: "not started",
        type: normalizedType,
      });

      createdAssignments.push(created);
    }

    for (const generatedSubtask of generated.subtasks) {
      const linkedCourse = generatedSubtask.courseTitle
        ? profile.courseMap.get(
            normalizeCourseKey(generatedSubtask.courseTitle)
          )
        : undefined;

      const created = await this.generalTaskModel.create({
        studentId,
        semesterCourseId: linkedCourse?.semesterCourseId,
        description: generatedSubtask.title,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        done: false,
        estimatedTimeValue: generatedSubtask.estimatedTimeMinutes,
        estimatedTimeUnit: "minutes",
      });

      createdSubtasks.push(created);
    }

    return {
      createdAssignments: createdAssignments.length,
      createdSubtasks: createdSubtasks.length,
      skippedAssignments:
        generated.assignments.length - createdAssignments.length,
      generatedCounts: {
        assignments: generated.assignments.length,
        subtasks: generated.subtasks.length,
      },
    };
  }

  private normalizeAssignmentType(type: string) {
    const normalizedType = type.toLowerCase();

    if (NORMALIZED_ASSIGNMENT_TYPES.has(normalizedType)) {
      return normalizedType as
        | "homework"
        | "practice"
        | "project"
        | "report"
        | "lab";
    }

    return "homework";
  }
}
