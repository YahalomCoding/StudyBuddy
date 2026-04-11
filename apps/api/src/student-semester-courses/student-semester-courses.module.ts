import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentSemesterCourse } from "./student-semester-course.model";

@Module({ imports: [SequelizeModule.forFeature([StudentSemesterCourse])] })
export class StudentSemesterCoursesModule {}
