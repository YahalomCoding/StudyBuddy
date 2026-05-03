/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  Module,
} from "@nestjs/common";
import {
  APP_FILTER,
  APP_INTERCEPTOR,
  APP_PIPE,
  BaseExceptionFilter,
} from "@nestjs/core";
import { SequelizeModule } from "@nestjs/sequelize";
import {
  ZodSerializationException,
  ZodSerializerInterceptor,
  ZodValidationPipe,
} from "nestjs-zod";
import { ZodError } from "zod";
import { AssignmentsModule } from "../assignments/assignments.module";
import { ChatModule } from "../chat/chat.module";
import { CoursesModule } from "../courses/courses.module";
import { DegreesModule } from "../degrees/degrees.module";
import { ExamsModule } from "../exams/exams.module";
import { GeneralTasksModule } from "../general-tasks/general-tasks.module";
import { QuestionnaireModule } from "../questionnaire/questionnaire.module";
import { SemesterCoursesModule } from "../semester-courses/semester-courses.module";
import { SemestersModule } from "../semesters/semesters.module";
import { StudentDegreesModule } from "../student-degrees/student-degrees.module";
import { StudentSemesterCoursesModule } from "../student-semester-courses/student-semester-courses.module";
import { StudentsModule } from "../students/students.module";
import { UsersModule } from "../users/users.module";

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const serializationException = exception as ZodSerializationException;
      const zodError = serializationException.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }

    super.catch(exception, host);
  }
}

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? "5432"),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      synchronize: true,
    }),
    ChatModule,
    DegreesModule,
    UsersModule,
    CoursesModule,
    StudentsModule,
    StudentDegreesModule,
    SemestersModule,
    SemesterCoursesModule,
    StudentSemesterCoursesModule,
    AssignmentsModule,
    ExamsModule,
    GeneralTasksModule,
    QuestionnaireModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
