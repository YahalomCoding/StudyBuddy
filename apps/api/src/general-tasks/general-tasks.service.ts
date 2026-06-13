import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { GeneralTask } from "./general-task.model";

const DURATION_UNITS = ["minutes", "hours", "days"] as const;
type DurationUnit = (typeof DURATION_UNITS)[number];

export type UpdateGeneralTaskPayload = {
  done?: boolean;
  estimatedTimeValue?: number;
  estimatedTimeUnit?: DurationUnit;
};

@Injectable()
export class GeneralTasksService {
  constructor(
    @InjectModel(GeneralTask)
    private readonly generalTaskModel: typeof GeneralTask
  ) {}

  async updateTask(
    id: string,
    payload: UpdateGeneralTaskPayload
  ): Promise<GeneralTask> {
    const task = await this.generalTaskModel.findByPk(id);

    if (!task) {
      throw new NotFoundException("General task not found");
    }

    const updateData: Partial<GeneralTask> = {};

    if (typeof payload.done === "boolean") {
      updateData.done = payload.done;
    }

    if (typeof payload.estimatedTimeValue === "number") {
      updateData.estimatedTimeValue = Math.max(
        1,
        Math.round(payload.estimatedTimeValue)
      );
    }

    if (
      payload.estimatedTimeUnit &&
      DURATION_UNITS.includes(payload.estimatedTimeUnit)
    ) {
      updateData.estimatedTimeUnit = payload.estimatedTimeUnit;
    }

    await task.update(updateData);
    return task;
  }
}
