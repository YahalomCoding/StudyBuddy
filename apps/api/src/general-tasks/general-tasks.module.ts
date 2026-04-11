import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GeneralTask } from "./general-task.model";

@Module({ imports: [SequelizeModule.forFeature([GeneralTask])] })
export class GeneralTasksModule {}
