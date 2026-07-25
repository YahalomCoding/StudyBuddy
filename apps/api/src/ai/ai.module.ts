import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/course.model";
import { Exam } from "../exams/exam.model";
import { GeneralTask } from "../general-tasks/general-task.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { AIController } from "./ai.controller";
import { AiFeaturesService } from "./ai-features.service";
import { ToolsService } from "./tools.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Student,
      GeneralTask,
      Assignment,
      Exam,
      StudentSemesterCourse,
      SemesterCourse,
      Course,
    ]),
  ],
  controllers: [AIController],
  providers: [AiFeaturesService, ToolsService],
  exports: [ToolsService],
})
export class AIModule {}
