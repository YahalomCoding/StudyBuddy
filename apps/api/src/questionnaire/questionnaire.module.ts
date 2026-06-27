import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Student } from "../students/student.model";
import { User } from "../users/user.model";
import { QuestionnaireController } from "./questionnaire.controller";
import { QuestionnaireService } from "./questionnaire.service";

@Module({
  imports: [SequelizeModule.forFeature([User, Student])],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService],
})
export class QuestionnaireModule {}
