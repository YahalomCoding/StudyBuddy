import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Exam } from "./exam.model";

@Module({ imports: [SequelizeModule.forFeature([Exam])] })
export class ExamsModule {}
