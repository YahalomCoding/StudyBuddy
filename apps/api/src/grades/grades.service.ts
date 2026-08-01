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
    payload: { examGrade?: number | null; assignmentGrade?: number | null }
  ) {
    const studentSemesterCourse = await this.studentSemesterCourseModel.findOne(
      {
        where: { studentId },
        include: [
          {
            model: this.semesterCourseModel,
            include: [
              {
                model: this.courseModel,
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

      await this.examModel.update(
        { grade: normalizedGrade },
        { where: { studentSemesterCourseId: studentSemesterCourse.id } }
      );
    }

    if (payload.assignmentGrade !== undefined) {
      const normalizedGrade = this.normalizeGradeValue(payload.assignmentGrade);

      await this.assignmentModel.update(
        { grade: normalizedGrade },
        { where: { studentSemesterCourseId: studentSemesterCourse.id } }
      );
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
            attributes: ["id", "description", "grade"],
            where: { grade: { [Symbol.for("ne")]: null } },
            required: false,
          },
          {
            model: this.examModel,
            attributes: ["id", "type", "grade"],
            where: { grade: { [Symbol.for("ne")]: null } },
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

        const exams = (studentSemesterCourse.exams ?? []).filter(
          (exam) => exam.grade !== null
        );
        const assignments = (studentSemesterCourse.assignments ?? []).filter(
          (assignment) => assignment.grade !== null
        );

        const examGrade =
          exams.length > 0
            ? exams.reduce((sum, exam) => sum + (exam.grade ?? 0), 0) /
              exams.length
            : null;

        const assignmentGrade =
          assignments.length > 0
            ? assignments.reduce(
                (sum, assignment) => sum + (assignment.grade ?? 0),
                0
              ) / assignments.length
            : null;

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
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
