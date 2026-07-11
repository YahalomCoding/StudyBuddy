import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { QuestionnaireForm } from "@studybuddy/schemas";
import { Student } from "../students/student.model";
import { User } from "../users/user.model";

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Student) private readonly studentModel: typeof Student
  ) {}

  async submit(userId: string, data: QuestionnaireForm): Promise<Student> {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException("User not found");

    const existingStudent = await this.studentModel.findOne({ where: { userId } });
    if (existingStudent) {
      throw new BadRequestException("Onboarding was already submitted for this user");
    }

    return this.studentModel.create({
      userId,
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
    });
  }
}
