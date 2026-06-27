import { Body, Controller, Param, Patch } from "@nestjs/common";
import {
    GeneralTasksService,
    type UpdateGeneralTaskPayload,
} from "./general-tasks.service";

@Controller("general-tasks")
export class GeneralTasksController {
  constructor(private readonly generalTasksService: GeneralTasksService) {}

  @Patch(":id")
  async updateTask(
    @Param("id") id: string,
    @Body() body: UpdateGeneralTaskPayload
  ) {
    return this.generalTasksService.updateTask(id, body);
  }
}
