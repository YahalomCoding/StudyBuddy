import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { StudentSemesterCourse } from "./student-semester-course.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Course } from "../courses/course.model";
import { Semester } from "../semesters/semester.model";

@Injectable()
export class StudentSemesterCoursesService {
  constructor(
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse
  ) {}

  async getOrderedFormattedCoursesByStudentId(studentId: string) {
    const studentSemesterCoursesByStudentId =
      await this.studentSemesterCourseModel.findAll({
        where: { studentId },
        attributes: ["id"],
        include: [
          {
            model: SemesterCourse,
            required: true,
            attributes: ["id"],
            include: [
              {
                model: Course,
                required: true,
                attributes: ["id", "title"],
              },
              {
                model: Semester,
                required: true,
                attributes: ["id", "yearNumber", "semesterNumber"],
              },
            ],
          },
        ],
      });

    const formattedCoursesByStudentId = studentSemesterCoursesByStudentId.map(
      ({
        id: studentSemesterCourseId,
        semesterCourse: {
          course: { id: courseId, title: courseTitle },
          semester: { yearNumber, semesterNumber },
        },
      }) => ({
        id: studentSemesterCourseId,
        studentSemesterCourseId,
        courseTitle,
        semesterLabel: `סמסטר ${semesterNumber} / ${yearNumber}`,
        courseId,
      })
    );

    const orederedFormattedCoursesByStudentId =
      formattedCoursesByStudentId.sort(
        ({ courseTitle: prevCourseTitle }, { courseTitle: currCourseTitle }) =>
          prevCourseTitle.localeCompare(currCourseTitle, "he")
      );

    return orederedFormattedCoursesByStudentId;
  }
}
