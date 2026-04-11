import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentDegree } from "./student-degree.model";

@Module({ imports: [SequelizeModule.forFeature([StudentDegree])] })
export class StudentDegreesModule {}
