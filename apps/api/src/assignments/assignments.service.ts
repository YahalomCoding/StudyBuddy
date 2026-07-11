import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Assignment } from "./assignment.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";

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

export type UpdateAssignmentPayload = {
  title?: string;
  dueDate?: string;
  status?: AssignmentStatus;
  type?: AssignmentType;
};

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,

    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse,

    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {}

  async importAssignmentsFromIcs(
    userId: string,
    fileBuffer: Buffer
  ): Promise<{ createdCount: number }> {
    const icalModule = await import("ical.js");
    const ICAL = (icalModule as any).default ?? icalModule;

    const student = await this.studentModel.findOne({
      where: {
        userId,
      },
    });

    if (!student) {
      throw new BadRequestException(
        "User is not connected to a student profile."
      );
    }

    const studentSemesterCourse =
      await this.studentSemesterCourseModel.findOne({
        where: {
          studentId: student.id,
        },
      });

    if (!studentSemesterCourse) {
      throw new BadRequestException(
        "Student has no semester course. Cannot import assignments."
      );
    }

    const icsText = fileBuffer.toString("utf-8");

    let calendarComponent: any;

    try {
      const parsedData = ICAL.parse(icsText);
      calendarComponent = new ICAL.Component(parsedData);
    } catch {
      throw new BadRequestException("Invalid ICS file");
    }

    const events = calendarComponent.getAllSubcomponents("vevent");

    if (!events.length) {
      throw new BadRequestException("No events found in ICS file");
    }

    const createdAssignments: Assignment[] = [];

    for (const eventComponent of events) {
      const event = new ICAL.Event(eventComponent);

      const description =
        event.summary?.trim() ||
        event.description?.trim() ||
        "Imported assignment";

      const deadline =
        event.startDate?.toJSDate() || event.endDate?.toJSDate();

      if (!deadline || Number.isNaN(deadline.getTime())) {
        continue;
      }

      const assignment = await this.assignmentModel.create({
        studentSemesterCourseId: studentSemesterCourse.id,
        description,
        deadline,
        grade: null,
        status: "not started",
        type: "assignment",
      });

      createdAssignments.push(assignment);
    }

    return {
      createdCount: createdAssignments.length,
    };
  }

  async updateAssignment(
    id: string,
    payload: UpdateAssignmentPayload
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findByPk(id);

    if (!assignment) {
      throw new NotFoundException("Assignment not found");
    }

    const updateData: Partial<Assignment> = {};

    if (payload.status && ASSIGNMENT_STATUSES.includes(payload.status)) {
      updateData.status = payload.status;
    }

    if (payload.type && ASSIGNMENT_TYPES.includes(payload.type)) {
      updateData.type = payload.type;
    }

    if (typeof payload.title === "string" && payload.title.trim().length > 0) {
      updateData.description = payload.title.trim();
    }

    if (typeof payload.dueDate === "string") {
      const parsedDueDate = new Date(payload.dueDate);

      if (!Number.isNaN(parsedDueDate.getTime())) {
        updateData.deadline = parsedDueDate;
      }
    }

    await assignment.update(updateData);

    return assignment;
  }

  async deleteAssignment(id: string): Promise<{ success: true }> {
    const assignment = await this.assignmentModel.findByPk(id);

    if (!assignment) {
      throw new NotFoundException("Assignment not found");
    }

    await assignment.destroy();

    return { success: true };
  }
}