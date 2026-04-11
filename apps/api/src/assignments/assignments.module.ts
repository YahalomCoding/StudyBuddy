import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "./assignment.model";

@Module({ imports: [SequelizeModule.forFeature([Assignment])] })
export class AssignmentsModule {}
