import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Degree } from "./degree.model";

@Module({ imports: [SequelizeModule.forFeature([Degree])] })
export class DegreesModule {}
