import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SemesterCourse } from "./semester-course.model";

@Module({ imports: [SequelizeModule.forFeature([SemesterCourse])] })
export class SemesterCoursesModule {}
