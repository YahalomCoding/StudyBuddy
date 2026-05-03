import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Semester } from "./semester.model";

@Module({ imports: [SequelizeModule.forFeature([Semester])] })
export class SemestersModule {}
