import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Course } from "../courses/courses.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "../syllabi/course-syllabus.model";
import type { AssessmentKind, SyllabusData } from "../syllabi/syllabus.schemas";

type SyllabusAssessment = SyllabusData["assessments"][number];

type UpdateCourseGradesPayload = {
  examGrade?: number | null;
  assignmentGrade?: number | null;
  examId?: string | null;
  assignmentId?: string | null;
  assessmentTitle?: string | null;
  assessmentDueDate?: string | null;
  assessmentKind?: AssessmentKind | null;
};

type GradeAssessmentItem = {
  id: string;
  databaseId: string | null;
  source: "syllabus" | "assignment" | "exam";
  title: string;
  kind: AssessmentKind;
  typeLabel: string;
  gradeType: "assignment" | "exam";
  weightPercent: number | null;
  grade: number | null;
  dueDate: string | null;
  weightedContribution: number | null;
};

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
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse,
    @InjectModel(CourseSyllabus)
    private readonly courseSyllabusModel: typeof CourseSyllabus
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
    payload: UpdateCourseGradesPayload
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
      await this.saveExamGrade(
        studentSemesterCourse.id,
        payload.examId,
        payload.examGrade,
        payload.assessmentDueDate
      );
    }

    if (payload.assignmentGrade !== undefined) {
      await this.saveAssignmentGrade(
        studentSemesterCourse.id,
        payload.assignmentId,
        payload.assignmentGrade,
        payload.assessmentTitle,
        payload.assessmentDueDate,
        payload.assessmentKind
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
                model: Semester,
                attributes: ["yearNumber", "semesterNumber"],
              },
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
              "deadline",
              "type",
              "grade",
              "createdAt",
              "updatedAt",
            ],
            required: false,
          },
          {
            model: this.examModel,
            attributes: [
              "id",
              "type",
              "date",
              "grade",
              "createdAt",
              "updatedAt",
            ],
            required: false,
          },
        ],
      });

    const studentSemesterCourseIds = studentSemesterCourses.map(
      (item) => item.id
    );
    const syllabusRecords = studentSemesterCourseIds.length
      ? await this.courseSyllabusModel.findAll({
          where: {
            studentSemesterCourseId: {
              [Op.in]: studentSemesterCourseIds,
            },
          },
        })
      : [];
    const syllabusByCourseId = new Map(
      syllabusRecords.map((record) => [
        record.studentSemesterCourseId,
        record.parsedData,
      ])
    );

    return studentSemesterCourses
      .map((studentSemesterCourse) => {
        const course = studentSemesterCourse.semesterCourse?.course;

        if (!course) {
          return null;
        }

        const syllabus =
          syllabusByCourseId.get(studentSemesterCourse.id) ?? null;
        const assessments = this.buildAssessmentRows(
          syllabus,
          studentSemesterCourse.assignments ?? [],
          studentSemesterCourse.exams ?? []
        );
        const calculation = this.calculateCourseGrade(assessments);
        const examAssessments = assessments.filter(
          (assessment) => assessment.gradeType === "exam"
        );
        const assignmentAssessments = assessments.filter(
          (assessment) => assessment.gradeType === "assignment"
        );
        const semester = studentSemesterCourse.semesterCourse?.semester;

        return {
          courseId: course.id,
          studentSemesterCourseId: studentSemesterCourse.id,
          courseTitle: syllabus?.course.title?.trim() || course.title,
          semesterYearNumber: semester?.yearNumber ?? null,
          semesterNumber: semester?.semesterNumber ?? null,
          credits: Number(course.credits ?? 0),
          examGrade: this.averageGrades(examAssessments),
          assignmentGrade: this.averageGrades(assignmentAssessments),
          finalGrade: calculation.finalGrade,
          currentGrade: calculation.currentGrade,
          totalWeightPercent: calculation.totalWeightPercent,
          completedWeightPercent: calculation.completedWeightPercent,
          examId:
            examAssessments.find((assessment) => assessment.grade !== null)
              ?.databaseId ??
            examAssessments[0]?.databaseId ??
            null,
          assignmentId:
            assignmentAssessments.find(
              (assessment) => assessment.grade !== null
            )?.databaseId ??
            assignmentAssessments[0]?.databaseId ??
            null,
          assessments,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private async saveExamGrade(
    studentSemesterCourseId: string,
    examId: string | null | undefined,
    grade: number | null,
    assessmentDueDate?: string | null
  ) {
    const normalizedGrade = this.normalizeGradeValue(grade);
    let exam: Exam | null = null;

    if (examId) {
      exam = await this.examModel.findOne({
        where: { id: examId, studentSemesterCourseId },
      });
    }

    const date = this.parseDateOnly(assessmentDueDate) ?? new Date();

    if (!exam) {
      exam = await this.examModel.findOne({
        where: { studentSemesterCourseId, date, type: 1 },
      });
    }

    if (exam) {
      await exam.update({ grade: normalizedGrade });
      return;
    }

    await this.examModel.create({
      studentSemesterCourseId,
      grade: normalizedGrade,
      date,
      type: 1,
    });
  }

  private async saveAssignmentGrade(
    studentSemesterCourseId: string,
    assignmentId: string | null | undefined,
    grade: number | null,
    assessmentTitle?: string | null,
    assessmentDueDate?: string | null,
    assessmentKind?: AssessmentKind | null
  ) {
    const normalizedGrade = this.normalizeGradeValue(grade);
    const description = assessmentTitle?.trim() || "Grade entry";
    let assignment: Assignment | null = null;

    if (assignmentId) {
      assignment = await this.assignmentModel.findOne({
        where: { id: assignmentId, studentSemesterCourseId },
      });
    }

    if (!assignment && assessmentTitle?.trim()) {
      assignment = await this.assignmentModel.findOne({
        where: {
          studentSemesterCourseId,
          description: assessmentTitle.trim(),
        },
      });
    }

    if (assignment) {
      await assignment.update({ grade: normalizedGrade });
      return;
    }

    await this.assignmentModel.create({
      studentSemesterCourseId,
      description,
      deadline: this.parseDateOnly(assessmentDueDate) ?? new Date(),
      grade: normalizedGrade,
      status: normalizedGrade === null ? "not started" : "done",
      type: this.mapAssessmentKind(assessmentKind ?? "assignment"),
    });
  }

  private buildAssessmentRows(
    syllabus: SyllabusData | null,
    assignments: Assignment[],
    exams: Exam[]
  ): GradeAssessmentItem[] {
    const usedAssignmentIds = new Set<string>();
    const usedExamIds = new Set<string>();

    const syllabusRows = (syllabus?.assessments ?? []).map(
      (assessment, index): GradeAssessmentItem => {
        if (assessment.kind === "exam") {
          const exam = this.findMatchingExam(assessment, exams, usedExamIds);

          if (exam) usedExamIds.add(exam.id);

          return this.toAssessmentRow(assessment, index, exam ?? null, null);
        }

        const assignment = this.findMatchingAssignment(
          assessment,
          assignments,
          usedAssignmentIds
        );

        if (assignment) usedAssignmentIds.add(assignment.id);

        return this.toAssessmentRow(
          assessment,
          index,
          null,
          assignment ?? null
        );
      }
    );

    const extraAssignments = assignments
      .filter((assignment) => !usedAssignmentIds.has(assignment.id))
      .map<GradeAssessmentItem>((assignment) => ({
        id: `assignment-${assignment.id}`,
        databaseId: assignment.id,
        source: "assignment",
        title: assignment.description,
        kind: this.assignmentTypeToKind(assignment.type),
        typeLabel: this.assignmentTypeLabel(assignment.type),
        gradeType: "assignment",
        weightPercent: null,
        grade: assignment.grade,
        dueDate: this.toDateOnly(assignment.deadline),
        weightedContribution: null,
      }));

    const extraExams = exams
      .filter((exam) => !usedExamIds.has(exam.id))
      .map<GradeAssessmentItem>((exam) => ({
        id: `exam-${exam.id}`,
        databaseId: exam.id,
        source: "exam",
        title: this.examTypeLabel(exam.type),
        kind: "exam",
        typeLabel: this.examTypeLabel(exam.type),
        gradeType: "exam",
        weightPercent: null,
        grade: exam.grade,
        dueDate: this.toDateOnly(exam.date),
        weightedContribution: null,
      }));

    return [...syllabusRows, ...extraAssignments, ...extraExams].sort(
      (left, right) => {
        if (!left.dueDate && !right.dueDate) {
          return left.title.localeCompare(right.title, "he");
        }
        if (!left.dueDate) return 1;
        if (!right.dueDate) return -1;
        return left.dueDate.localeCompare(right.dueDate);
      }
    );
  }

  private toAssessmentRow(
    assessment: SyllabusAssessment,
    index: number,
    exam: Exam | null,
    assignment: Assignment | null
  ): GradeAssessmentItem {
    const grade = assignment?.grade ?? exam?.grade ?? null;
    const weightPercent = assessment.weightPercent;

    return {
      id: assessment.id || `syllabus-assessment-${index + 1}`,
      databaseId: assignment?.id ?? exam?.id ?? null,
      source: "syllabus",
      title: assessment.title,
      kind: assessment.kind,
      typeLabel: this.assessmentKindLabel(assessment.kind),
      gradeType: assessment.kind === "exam" ? "exam" : "assignment",
      weightPercent,
      grade,
      dueDate:
        assignment?.deadline || exam?.date
          ? this.toDateOnly(assignment?.deadline ?? exam?.date ?? null)
          : assessment.dueDate,
      weightedContribution:
        grade !== null && weightPercent !== null
          ? this.roundGrade((grade * weightPercent) / 100)
          : null,
    };
  }

  private calculateCourseGrade(assessments: GradeAssessmentItem[]) {
    const weightedAssessments = assessments.filter(
      (assessment) =>
        assessment.weightPercent !== null && assessment.weightPercent > 0
    );
    const gradedWeightedAssessments = weightedAssessments.filter(
      (assessment) => assessment.grade !== null
    );
    const totalWeightPercent = weightedAssessments.reduce(
      (sum, assessment) => sum + (assessment.weightPercent ?? 0),
      0
    );
    const completedWeightPercent = gradedWeightedAssessments.reduce(
      (sum, assessment) => sum + (assessment.weightPercent ?? 0),
      0
    );
    const weightedNumerator = gradedWeightedAssessments.reduce(
      (sum, assessment) =>
        sum + (assessment.grade ?? 0) * (assessment.weightPercent ?? 0),
      0
    );

    if (totalWeightPercent > 0) {
      return {
        totalWeightPercent: this.roundGrade(totalWeightPercent) ?? 0,
        completedWeightPercent: this.roundGrade(completedWeightPercent) ?? 0,
        currentGrade:
          completedWeightPercent > 0
            ? this.roundGrade(weightedNumerator / completedWeightPercent)
            : null,
        finalGrade:
          gradedWeightedAssessments.length === weightedAssessments.length
            ? this.roundGrade(weightedNumerator / totalWeightPercent)
            : null,
      };
    }

    const gradedAssessments = assessments.filter(
      (assessment) => assessment.grade !== null
    );
    const average = this.averageGrades(gradedAssessments);

    return {
      totalWeightPercent: 0,
      completedWeightPercent: 0,
      currentGrade: average,
      finalGrade:
        assessments.length > 0 &&
        gradedAssessments.length === assessments.length
          ? average
          : null,
    };
  }

  private averageGrades(assessments: GradeAssessmentItem[]) {
    const grades = assessments
      .map((assessment) => assessment.grade)
      .filter((grade): grade is number => grade !== null);

    if (grades.length === 0) return null;

    return this.roundGrade(
      grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    );
  }

  private findMatchingAssignment(
    assessment: SyllabusAssessment,
    assignments: Assignment[],
    usedIds: Set<string>
  ) {
    const normalizedTitle = this.normalizeText(assessment.title);
    const titleMatch = assignments.find(
      (assignment) =>
        !usedIds.has(assignment.id) &&
        this.normalizeText(assignment.description) === normalizedTitle
    );

    if (titleMatch) return titleMatch;

    if (assessment.dueDate) {
      return assignments.find(
        (assignment) =>
          !usedIds.has(assignment.id) &&
          this.toDateOnly(assignment.deadline) === assessment.dueDate
      );
    }

    return undefined;
  }

  private findMatchingExam(
    assessment: SyllabusAssessment,
    exams: Exam[],
    usedIds: Set<string>
  ) {
    if (assessment.dueDate) {
      const dateMatch = exams.find(
        (exam) =>
          !usedIds.has(exam.id) &&
          this.toDateOnly(exam.date) === assessment.dueDate
      );

      if (dateMatch) return dateMatch;
    }

    return exams.find((exam) => !usedIds.has(exam.id));
  }

  private normalizeText(value: string) {
    return value.trim().toLocaleLowerCase("he").replace(/\s+/g, " ");
  }

  private parseDateOnly(value?: string | null): Date | null {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T12:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateOnly(value: Date | null): string | null {
    return value ? value.toISOString().slice(0, 10) : null;
  }

  private roundGrade(value: number | null) {
    return value === null ? null : Math.round(value * 10) / 10;
  }

  private mapAssessmentKind(kind: AssessmentKind): Assignment["type"] {
    switch (kind) {
      case "project":
      case "presentation":
        return "project";
      case "lab":
        return "lab";
      case "participation":
        return "practice";
      case "assignment":
        return "assignment";
      case "other":
      case "exam":
        return "homework";
      default:
        return "homework";
    }
  }

  private assignmentTypeToKind(type: Assignment["type"]): AssessmentKind {
    switch (type) {
      case "project":
        return "project";
      case "lab":
        return "lab";
      case "practice":
        return "participation";
      case "assignment":
      case "homework":
      case "report":
        return "assignment";
      default:
        return "assignment";
    }
  }

  private assignmentTypeLabel(type: Assignment["type"]) {
    switch (type) {
      case "assignment":
        return "מטלה";
      case "homework":
        return "שיעורי בית";
      case "practice":
        return "תרגול";
      case "project":
        return "פרויקט";
      case "report":
        return "דוח";
      case "lab":
        return "מעבדה";
      default:
        return "מטלה";
    }
  }

  private assessmentKindLabel(kind: AssessmentKind) {
    switch (kind) {
      case "assignment":
        return "מטלה";
      case "exam":
        return "מבחן";
      case "project":
        return "פרויקט";
      case "presentation":
        return "מצגת";
      case "participation":
        return "השתתפות";
      case "lab":
        return "מעבדה";
      case "other":
        return "אחר";
      default:
        return "אחר";
    }
  }

  private examTypeLabel(type: number) {
    switch (type) {
      case 1:
        return "מועד א׳";
      case 2:
        return "מועד ב׳";
      default:
        return "מבחן";
    }
  }

  async updateAssessmentWeight(
    studentId: string,
    courseId: string,
    assessmentId: string,
    weightPercent: number
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

    if (!studentSemesterCourse) throw new NotFoundException("Course not found");

    const sequelize = this.studentSemesterCourseModel.sequelize;
    if (!sequelize) throw new Error("Sequelize not available");

    // Try to find a matching assignment or exam by databaseId prefix
    if (assessmentId.startsWith("assignment-")) {
      const dbId = assessmentId.replace("assignment-", "");
      await sequelize.query(
        'UPDATE "Assignments" SET "weightPercent" = :weightPercent WHERE id = :id',
        { replacements: { weightPercent, id: dbId } }
      );
      return this.getStudentGrades(studentId);
    }

    if (assessmentId.startsWith("exam-")) {
      const dbId = assessmentId.replace("exam-", "");
      await sequelize.query(
        'UPDATE "Exams" SET "weightPercent" = :weightPercent WHERE id = :id',
        { replacements: { weightPercent, id: dbId } }
      );
      return this.getStudentGrades(studentId);
    }

    // Syllabus-sourced assessment: update in parsedData
    const syllabusRecord = await this.courseSyllabusModel.findOne({
      where: { studentSemesterCourseId: studentSemesterCourse.id },
    });

    if (!syllabusRecord)
      throw new NotFoundException("Syllabus not found for this course");

    const updatedAssessments = syllabusRecord.parsedData.assessments.map((a) =>
      a.id === assessmentId ? { ...a, weightPercent } : a
    );

    await syllabusRecord.update({
      parsedData: {
        ...syllabusRecord.parsedData,
        assessments: updatedAssessments,
      },
    });

    return this.getStudentGrades(studentId);
  }
}
