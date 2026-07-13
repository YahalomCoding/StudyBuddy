import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentSemesterCourse } from "./student-semester-course.model";
import { StudentSemesterCoursesService } from "./student-semester-courses.service";

@Module({
  imports: [SequelizeModule.forFeature([StudentSemesterCourse])],
  providers: [StudentSemesterCoursesService],
  exports: [StudentSemesterCoursesService],
})
export class StudentSemesterCoursesModule {}
