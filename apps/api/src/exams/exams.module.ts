import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Exam } from "./exam.model";
import { ExamsController } from "./exams.controller";
import { ExamsService } from "./exams.service";

@Module({
  imports: [SequelizeModule.forFeature([Exam])],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
