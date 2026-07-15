import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GeneralTask } from "./general-task.model";
import { GeneralTasksController } from "./general-tasks.controller";
import { GeneralTasksService } from "./general-tasks.service";

@Module({
  imports: [SequelizeModule.forFeature([GeneralTask])],
  controllers: [GeneralTasksController],
  providers: [GeneralTasksService],
  exports: [GeneralTasksService],
})
export class GeneralTasksModule {}
