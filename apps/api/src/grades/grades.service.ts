import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/course.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,
    @InjectModel(Course) private readonly courseModel: typeof Course,
    @InjectModel(Exam) private readonly examModel: typeof Exam,
    @InjectModel(SemesterCourse)
    private readonly semesterCourseModel: typeof SemesterCourse,
    @InjectModel(Student) private readonly studentModel: typeof Student,
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse
  ) {}

  private normalizeGradeValue(value: number | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return Math.min(100, Math.max(0, parsedValue));
  }

  async updateStudentCourseGrades(
    studentId: string,
    courseId: string,
    payload: {
      examGrade?: number | null;
      assignmentGrade?: number | null;
      examId?: string | null;
      assignmentId?: string | null;
    }
  ) {
    const studentSemesterCourse = await this.studentSemesterCourseModel.findOne(
      {
        where: { studentId },
        include: [
          {
            model: this.semesterCourseModel,
            required: true,
            include: [
              {
                model: this.courseModel,
                required: true,
                where: { id: courseId },
                attributes: ["id"],
              },
            ],
          },
        ],
      }
    );

    if (!studentSemesterCourse) {
      throw new NotFoundException("Course not found for this student");
    }

    if (payload.examGrade !== undefined) {
      const normalizedGrade = this.normalizeGradeValue(payload.examGrade);
      const where = {
        studentSemesterCourseId: studentSemesterCourse.id,
        ...(payload.examId ? { id: payload.examId } : {}),
      };

      const updateResult = await this.examModel.update(
        { grade: normalizedGrade },
        { where }
      );
      const affectedRows = Array.isArray(updateResult)
        ? updateResult[0]
        : updateResult;

      if (Number(affectedRows) === 0) {
        await this.examModel.create({
          studentSemesterCourseId: studentSemesterCourse.id,
          grade: normalizedGrade,
          date: new Date(),
          type: 1,
        });
      }
    }

    if (payload.assignmentGrade !== undefined) {
      const normalizedGrade = this.normalizeGradeValue(payload.assignmentGrade);
      const where = {
        studentSemesterCourseId: studentSemesterCourse.id,
        ...(payload.assignmentId ? { id: payload.assignmentId } : {}),
      };

      const updateResult = await this.assignmentModel.update(
        { grade: normalizedGrade },
        { where }
      );
      const affectedRows = Array.isArray(updateResult)
        ? updateResult[0]
        : updateResult;

      if (Number(affectedRows) === 0) {
        await this.assignmentModel.create({
          studentSemesterCourseId: studentSemesterCourse.id,
          description: "Grade entry",
          deadline: new Date(),
          grade: normalizedGrade,
          status: "done",
          type: "assignment",
        });
      }
    }

    return this.getStudentGrades(studentId);
  }

  async getStudentGrades(studentId: string) {
    const student = await this.studentModel.findByPk(studentId);

    if (!student) {
      return [];
    }

    const studentSemesterCourses =
      await this.studentSemesterCourseModel.findAll({
        where: { studentId },
        include: [
          {
            model: this.semesterCourseModel,
            include: [
              {
                model: this.courseModel,
                attributes: ["id", "title", "credits"],
              },
            ],
          },
          {
            model: this.assignmentModel,
            attributes: [
              "id",
              "description",
              "grade",
              "createdAt",
              "updatedAt",
            ],
            required: false,
          },
          {
            model: this.examModel,
            attributes: ["id", "type", "grade", "createdAt", "updatedAt"],
            required: false,
          },
        ],
      });

    return studentSemesterCourses
      .map((studentSemesterCourse) => {
        const course = studentSemesterCourse.semesterCourse?.course;

        if (!course) {
          return null;
        }

        const exams = studentSemesterCourse.exams ?? [];
        const assignments = studentSemesterCourse.assignments ?? [];
        const latestGradedExam = exams
          .filter((exam) => exam.grade !== null)
          .sort((left, right) => {
            const leftTimestamp = new Date(
              left.updatedAt ?? left.createdAt ?? 0
            ).getTime();
            const rightTimestamp = new Date(
              right.updatedAt ?? right.createdAt ?? 0
            ).getTime();
            return rightTimestamp - leftTimestamp;
          })[0];
        const latestGradedAssignment = assignments
          .filter((assignment) => assignment.grade !== null)
          .sort((left, right) => {
            const leftTimestamp = new Date(
              left.updatedAt ?? left.createdAt ?? 0
            ).getTime();
            const rightTimestamp = new Date(
              right.updatedAt ?? right.createdAt ?? 0
            ).getTime();
            return rightTimestamp - leftTimestamp;
          })[0];

        const examGrade = latestGradedExam?.grade ?? null;

        const assignmentGrade = latestGradedAssignment?.grade ?? null;

        const finalGrade =
          examGrade !== null && assignmentGrade !== null
            ? examGrade * 0.6 + assignmentGrade * 0.4
            : (examGrade ?? assignmentGrade);

        return {
          courseId: course.id,
          courseTitle: course.title,
          credits: Number(course.credits ?? 0),
          examGrade:
            examGrade !== null ? Math.round(examGrade * 10) / 10 : null,
          assignmentGrade:
            assignmentGrade !== null
              ? Math.round(assignmentGrade * 10) / 10
              : null,
          finalGrade:
            finalGrade !== null ? Math.round(finalGrade * 10) / 10 : null,
          examId: latestGradedExam?.id ?? exams[0]?.id ?? null,
          assignmentId:
            latestGradedAssignment?.id ?? assignments[0]?.id ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
