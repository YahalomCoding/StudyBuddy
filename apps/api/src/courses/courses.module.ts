import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "../syllabi/course-syllabus.model";
import { Course } from "./courses.model";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Course,
      Degree,
      Semester,
      SemesterCourse,
      Student,
      StudentSemesterCourse,
      Assignment,
      Exam,
      CourseSyllabus,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
