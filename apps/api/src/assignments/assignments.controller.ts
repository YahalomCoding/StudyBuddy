import { Body, Controller, Param, Patch } from "@nestjs/common";
import {
    AssignmentsService,
    type UpdateAssignmentPayload,
} from "./assignments.service";

@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Patch(":id")
  async updateAssignment(
    @Param("id") id: string,
    @Body() body: UpdateAssignmentPayload
  ) {
    return this.assignmentsService.updateAssignment(id, body);
  }
}
