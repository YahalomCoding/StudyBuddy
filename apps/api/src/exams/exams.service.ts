import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Course } from "../courses/courses.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { UpcomingEventsTypesEnum } from "../types";
import { Exam } from "./exam.model";

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam)
    private readonly examModel: typeof Exam
  ) {}

  async getOredredFormattedExamsByStudentdId(studentId: string) {
    const ordredExamsByStudentId = await this.examModel.findAll({
      attributes: ["id", "type", "date"],
      include: [
        {
          model: StudentSemesterCourse,
          required: true,
          attributes: ["id"],
          include: [
            {
              model: Student,
              required: true,
              attributes: ["id"],
              where: { id: studentId },
            },
            {
              model: SemesterCourse,
              required: true,
              attributes: ["id"],
              include: [
                { model: Course, required: true, attributes: ["id", "title"] },
                {
                  model: Semester,
                  required: true,
                  attributes: ["id", "yearNumber", "semesterNumber"],
                },
              ],
            },
          ],
        },
      ],
      order: [["date", "ASC"]],
    });

    const ordredFormattedExamsByStudentId = ordredExamsByStudentId.map(
      ({
        id,
        studentSemesterCourse: {
          semesterCourse: {
            course: { title: courseTitle },
            semester: { yearNumber, semesterNumber },
          },
        },
        type,
        date,
      }) => ({
        id,
        kind: UpcomingEventsTypesEnum.EXAM,
        courseTitle,
        description: type === 1 ? "מועד א'" : "מועד ב'",
        eventDate: date.toISOString(),
        semesterLabel: `סמסטר ${semesterNumber} / ${yearNumber}`,
      })
    );

    return ordredFormattedExamsByStudentId;
  }

  async updateExam(
    examId: string,
    userId: string,
    payload: { date?: string; type?: number }
  ) {
    const exam = await this.examModel.findOne({
      where: { id: examId },
      include: [
        {
          model: StudentSemesterCourse,
          required: true,
          include: [{ model: Student, required: true, where: { userId } }],
        },
      ],
    });

    if (!exam) throw new NotFoundException("Exam not found");

    const updates: Partial<Pick<Exam, "date" | "type">> = {};
    if (payload.date) updates.date = new Date(payload.date);
    if (payload.type !== undefined) updates.type = payload.type;

    await exam.update(updates);
    return { ok: true };
  }
}
