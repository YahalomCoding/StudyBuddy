import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/course.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { GeneralTask } from "../general-tasks/general-task.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { User } from "../users/user.model";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Student,
      User,
      GeneralTask,
      Assignment,
      Exam,
      StudentSemesterCourse,
      SemesterCourse,
      Course,
      Degree,
      Semester,
    ]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
