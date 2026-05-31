import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Assignment } from "./assignment.model";

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
  status?: AssignmentStatus;
  type?: AssignmentType;
};

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment
  ) {}

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

    await assignment.update(updateData);
    return assignment;
  }
}
