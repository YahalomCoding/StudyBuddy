import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Exam } from "./exam.model";
import { ExamsService } from "./exams.service";

@Module({
  imports: [SequelizeModule.forFeature([Exam])],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
