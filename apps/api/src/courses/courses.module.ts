import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Course } from "./course.model";

@Module({ imports: [SequelizeModule.forFeature([Course])] })
export class CoursesModule {}
