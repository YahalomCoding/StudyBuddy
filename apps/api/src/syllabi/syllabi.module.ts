import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/courses.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentDegree } from "../student-degrees/student-degree.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "./course-syllabus.model";
import { SyllabusAiService } from "./syllabus-ai.service";
import { SyllabusPdfService } from "./syllabus-pdf.service";
import { SyllabiController } from "./syllabi.controller";
import { SyllabiService } from "./syllabi.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Student,
      StudentDegree,
      Degree,
      Course,
      Semester,
      SemesterCourse,
      StudentSemesterCourse,
      Assignment,
      Exam,
      CourseSyllabus,
    ]),
  ],
  controllers: [SyllabiController],
  providers: [SyllabiService, SyllabusPdfService, SyllabusAiService],
  exports: [SyllabiService],
})
export class SyllabiModule {}
