import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/courses.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "../syllabi/course-syllabus.model";
import { GradesController } from "./grades.controller";
import { GradesService } from "./grades.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Assignment,
      Course,
      Exam,
      SemesterCourse,
      Student,
      StudentSemesterCourse,
      CourseSyllabus,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}
