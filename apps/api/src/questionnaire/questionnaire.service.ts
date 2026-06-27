import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { QuestionnaireForm } from "@studybuddy/schemas";
import { randomUUID } from "node:crypto";
import { Student } from "../students/student.model";
import { User } from "../users/user.model";

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Student) private readonly studentModel: typeof Student
  ) {}

  async submit(data: QuestionnaireForm): Promise<Student> {
    const sequelize = this.userModel.sequelize;

    if (!sequelize) {
      throw new Error("Sequelize connection is not available");
    }

    return sequelize.transaction(async (transaction) => {
      const user = await this.userModel.create(
        {
          username: `${data.nickname}-${randomUUID()}`,
          password: "placeholder",
        },
        { transaction }
      );

      const student = await this.studentModel.create(
        {
          userId: user.id,
          studyType: data.studyType,
          faculty: data.faculty,
          coursesPerSemester: data.coursesPerSemester,
          workStatus: data.workStatus,
          studyAvailabilityDays: data.studyAvailabilityDays,
          realisticStudyHoursPerDay: data.realisticStudyHoursPerDay,
          focusTime: data.focusTime,
          preferredStudyDuration: data.preferredStudyDuration,
          strongTopics: data.strongTopics,
          challengingTopics: data.challengingTopics,
          semesterFocusGoal: data.semesterFocusGoal,
        },
        { transaction }
      );

      return student;
    });
  }
}
