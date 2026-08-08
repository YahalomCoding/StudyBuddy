import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { GeneralTask } from "./general-task.model";

const DURATION_UNITS = ["minutes", "hours", "days"] as const;
type DurationUnit = (typeof DURATION_UNITS)[number];

export type UpdateGeneralTaskPayload = {
  title?: string;
  dueDate?: string;
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
    payload: UpdateGeneralTaskPayload,
    studentId: string
  ): Promise<GeneralTask> {
    const task = await this.generalTaskModel.findOne({
      where: { id, studentId },
    });

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

    if (typeof payload.title === "string" && payload.title.trim().length > 0) {
      updateData.description = payload.title.trim();
    }

    if (typeof payload.dueDate === "string") {
      const parsedDueDate = new Date(payload.dueDate);
      if (!Number.isNaN(parsedDueDate.getTime())) {
        updateData.dueDate = parsedDueDate;
      }
    }

    await task.update(updateData);
    return task;
  }

  async deleteTask(id: string, studentId: string): Promise<{ success: true }> {
    const task = await this.generalTaskModel.findOne({
      where: { id, studentId },
    });

    if (!task) {
      throw new NotFoundException("General task not found");
    }

    await task.destroy();
    return { success: true };
  }

  async getOrderedFormattedGeneralTasksByStudentId(studentId: string) {
    const orderedGeneralTasksByStudentId = await this.generalTaskModel.findAll({
      where: { studentId },
      attributes: [
        "id",
        "description",
        "dueDate",
        "done",
        "estimatedTimeValue",
        "estimatedTimeUnit",
      ],
      order: [["dueDate", "ASC"]],
    });

    const orderedFormattedGeneralTasksByStudentId =
      orderedGeneralTasksByStudentId.map(
        ({
          id,
          description: title,
          dueDate,
          done,
          estimatedTimeValue,
          estimatedTimeUnit,
        }) => ({
          id,
          title,
          dueDate: dueDate.toISOString(),
          done,
          estimatedTime: { value: estimatedTimeValue, unit: estimatedTimeUnit },
        })
      );

    return orderedFormattedGeneralTasksByStudentId;
  }
}
