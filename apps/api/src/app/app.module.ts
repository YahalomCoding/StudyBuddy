/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ZodValidationPipe,
  ZodSerializerInterceptor,
  ZodSerializationException,
} from "nestjs-zod";
import { SequelizeModule } from "@nestjs/sequelize";
import {
  APP_PIPE,
  APP_INTERCEPTOR,
  APP_FILTER,
  BaseExceptionFilter,
} from "@nestjs/core";
import { ZodError } from "zod";
import {
  Module,
  HttpException,
  ArgumentsHost,
  Logger,
  Catch,
} from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { DegreesModule } from "../degrees/degrees.module";
import { UsersModule } from "../users/users.module";
import { CoursesModule } from "../courses/courses.module";
import { StudentsModule } from "../students/students.module";
import { StudentDegreesModule } from "../student-degrees/student-degrees.module";
import { SemestersModule } from "../semesters/semesters.module";
import { SemesterCoursesModule } from "../semester-courses/semester-courses.module";
import { StudentSemesterCoursesModule } from "../student-semester-courses/student-semester-courses.module";
import { AssignmentsModule } from "../assignments/assignments.module";
import { ExamsModule } from "../exams/exams.module";
import { GeneralTasksModule } from "../general-tasks/general-tasks.module";

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

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
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
