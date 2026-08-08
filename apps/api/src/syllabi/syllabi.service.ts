import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { Assignment } from "../assignments/assignment.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentDegree } from "../student-degrees/student-degree.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "./course-syllabus.model";
import { SyllabusAiService } from "./syllabus-ai.service";
import { SyllabusPdfService } from "./syllabus-pdf.service";
import type {
  AiSyllabusData,
  AssessmentKind,
  ConfirmSyllabusRequest,
  SyllabusData,
} from "./syllabus.schemas";

export type UploadedPdfFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type UpdateAssessmentDatePayload = {
  dueDate: string;
  databaseId?: string | null;
};

export type UpdateAssessmentDateResponse = {
  assessmentId: string;
  databaseId: string;
  dueDate: string;
  kind: AssessmentKind;
  created: boolean;
};

type DegreeOption = {
  id: string;
  title: string;
};

type PreviewResponse = {
  sourceFileName: string;
  pageCount: number;
  parser: "ai" | "heuristic";
  warnings: string[];
  missingFields: string[];
  availableDegrees: DegreeOption[];
  destination: {
    degreeId: string | null;
    degreeTitle: string | null;
    yearNumber: number;
    semesterNumber: number;
  };
  syllabus: SyllabusData;
};

type ConfirmResponse = {
  courseId: string;
  studentSemesterCourseId: string;
  syllabusId: string;
  createdAssignments: number;
  createdExams: number;
  skippedCalendarItems: number;
};

@Injectable()
export class SyllabiService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly pdfService: SyllabusPdfService,
    private readonly aiService: SyllabusAiService,
    @InjectModel(Student) private readonly studentModel: typeof Student,
    @InjectModel(StudentDegree)
    private readonly studentDegreeModel: typeof StudentDegree,
    @InjectModel(Degree) private readonly degreeModel: typeof Degree,
    @InjectModel(Semester) private readonly semesterModel: typeof Semester,
    @InjectModel(SemesterCourse)
    private readonly semesterCourseModel: typeof SemesterCourse,
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse,
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,
    @InjectModel(Exam) private readonly examModel: typeof Exam,
    @InjectModel(CourseSyllabus)
    private readonly courseSyllabusModel: typeof CourseSyllabus
  ) {}

  async preview(
    userId: string,
    file: UploadedPdfFile
  ): Promise<PreviewResponse> {
    this.validateUploadedFile(file);

    const student = await this.studentModel.findOne({ where: { userId } });
    if (!student) {
      throw new BadRequestException(
        "Complete onboarding before importing a syllabus"
      );
    }

    const extractedPdf = await this.pdfService.extractText(file.buffer);
    const parsed = await this.aiService.parse(extractedPdf.text, {
      userId,
      sourceFileName: file.originalname,
      pageCount: extractedPdf.pageCount,
    });
    const availableDegrees = await this.getAvailableDegrees(student.id);
    const syllabus = this.toEditableSyllabus(parsed.data);

    const warnings = [...parsed.warnings];
    if (extractedPdf.wasTruncated) {
      warnings.push(
        "The PDF was very long, so only the first 120,000 characters were analyzed."
      );
    }

    const destination = {
      degreeId:
        availableDegrees.length === 1
          ? (availableDegrees.at(0)?.id ?? null)
          : null,
      degreeTitle:
        availableDegrees.length === 0 ? (syllabus.faculty ?? null) : null,
      yearNumber: new Date().getFullYear(),
      semesterNumber:
        syllabus.course.semesterNumber &&
        syllabus.course.semesterNumber >= 1 &&
        syllabus.course.semesterNumber <= 3
          ? syllabus.course.semesterNumber
          : 1,
    };

    return {
      sourceFileName: file.originalname,
      pageCount: extractedPdf.pageCount,
      parser: parsed.parser,
      warnings,
      missingFields: this.getMissingFields(syllabus, availableDegrees),
      availableDegrees,
      destination,
      syllabus,
    };
  }

  async confirm(
    userId: string,
    payload: ConfirmSyllabusRequest
  ): Promise<ConfirmResponse> {
    const student = await this.studentModel.findOne({ where: { userId } });
    if (!student) {
      throw new BadRequestException(
        "Complete onboarding before importing a syllabus"
      );
    }

    return this.sequelize.transaction(async (transaction) => {
      const degree = await this.resolveDegree(
        student.id,
        payload.destination.degreeId,
        payload.destination.degreeTitle,
        transaction
      );
      const course = await this.findOrCreateCourse(
        payload.syllabus.course.title,
        degree.id,
        payload.syllabus.course.credits,
        transaction
      );
      const semester = await this.findOrCreateSemester(
        payload.destination.yearNumber,
        payload.destination.semesterNumber,
        transaction
      );
      const semesterCourse = await this.findOrCreateSemesterCourse(
        semester.id,
        course.id,
        transaction
      );
      const studentSemesterCourse =
        await this.findOrCreateStudentSemesterCourse(
          student.id,
          semesterCourse.id,
          transaction
        );

      const syllabusRecord = await this.saveSyllabus(
        studentSemesterCourse.id,
        payload,
        transaction
      );

      let createdAssignments = 0;
      let createdExams = 0;
      let skippedCalendarItems = 0;

      for (const assessment of payload.syllabus.assessments) {
        const normalizedTitle = assessment.title.trim();

        if (!normalizedTitle) {
          continue;
        }

        /*
         * Every syllabus assessment must have a valid date.
         * The backend enforces this as well, so the rule cannot be bypassed
         * by calling the API directly.
         */
        if (!assessment.dueDate) {
          throw new BadRequestException(
            `A date is required for "${normalizedTitle}"`
          );
        }

        const date = this.parseDateOnly(assessment.dueDate);

        if (!date) {
          throw new BadRequestException(
            `The date entered for "${normalizedTitle}" is invalid`
          );
        }

        if (assessment.kind === "exam") {
          /*
           * The current Exam model contains only date, type and grade.
           * Therefore the detected exam title remains in CourseSyllabus,
           * while the operational Exam row is identified by course, date
           * and exam type.
           */
          const [, created] = await this.examModel.findOrCreate({
            where: {
              studentSemesterCourseId: studentSemesterCourse.id,
              date,
              type: 1,
            },
            defaults: {
              studentSemesterCourseId: studentSemesterCourse.id,
              date,
              type: 1,
              grade: null,
            },
            transaction,
          });

          if (created) {
            createdExams += 1;
          }

          continue;
        }

        const assignmentType = this.mapAssessmentKind(assessment.kind);
        const existingAssignment = await this.assignmentModel.findOne({
          where: {
            studentSemesterCourseId: studentSemesterCourse.id,
            description: normalizedTitle,
          },
          transaction,
        });

        if (existingAssignment) {
          await existingAssignment.update(
            {
              description: normalizedTitle,
              deadline: date,
              type: assignmentType,
            },
            { transaction }
          );
        } else {
          await this.assignmentModel.create(
            {
              studentSemesterCourseId: studentSemesterCourse.id,
              description: normalizedTitle,
              deadline: date,
              grade: null,
              status: "not started",
              type: assignmentType,
            },
            { transaction }
          );
          createdAssignments += 1;
        }
      }

      return {
        courseId: course.id,
        studentSemesterCourseId: studentSemesterCourse.id,
        syllabusId: syllabusRecord.id,
        createdAssignments,
        createdExams,
        skippedCalendarItems,
      };
    });
  }

  async updateAssessmentDate(
    userId: string,
    studentSemesterCourseId: string,
    assessmentId: string,
    payload: UpdateAssessmentDatePayload
  ): Promise<UpdateAssessmentDateResponse> {
    const student = await this.studentModel.findOne({
      where: { userId },
    });

    if (!student) {
      throw new BadRequestException(
        "Complete onboarding before updating an assessment"
      );
    }

    const parsedDate = this.parseDateOnly(payload.dueDate);

    if (!parsedDate) {
      throw new BadRequestException(
        "The assessment date must use the YYYY-MM-DD format"
      );
    }

    return this.sequelize.transaction(async (transaction) => {
      const studentSemesterCourse =
        await this.studentSemesterCourseModel.findOne({
          where: {
            id: studentSemesterCourseId,
            studentId: student.id,
          },
          transaction,
        });

      if (!studentSemesterCourse) {
        throw new NotFoundException(
          "Course was not found for the current student"
        );
      }

      const syllabusRecord = await this.courseSyllabusModel.findOne({
        where: { studentSemesterCourseId },
        transaction,
      });

      if (!syllabusRecord) {
        throw new NotFoundException("No syllabus was found for this course");
      }

      const parsedData = JSON.parse(
        JSON.stringify(syllabusRecord.parsedData)
      ) as SyllabusData;

      const assessment = parsedData.assessments.find(
        (item) => item.id === assessmentId
      );

      if (!assessment) {
        throw new NotFoundException("Assessment was not found in the syllabus");
      }

      const previousDueDate = assessment.dueDate;
      let databaseId: string;
      let created = false;

      if (assessment.kind === "exam") {
        let exam: Exam | null = null;

        if (payload.databaseId) {
          exam = await this.examModel.findOne({
            where: {
              id: payload.databaseId,
              studentSemesterCourseId,
            },
            transaction,
          });
        }

        if (!exam && previousDueDate) {
          const previousDate = this.parseDateOnly(previousDueDate);

          if (previousDate) {
            exam = await this.examModel.findOne({
              where: {
                studentSemesterCourseId,
                date: previousDate,
                type: 1,
              },
              transaction,
            });
          }
        }

        if (exam) {
          await exam.update(
            {
              date: parsedDate,
              type: 1,
            },
            { transaction }
          );
        } else {
          const result = await this.examModel.findOrCreate({
            where: {
              studentSemesterCourseId,
              date: parsedDate,
              type: 1,
            },
            defaults: {
              studentSemesterCourseId,
              date: parsedDate,
              type: 1,
              grade: null,
            },
            transaction,
          });

          exam = result[0];
          created = result[1];
        }

        databaseId = exam.id;
      } else {
        const assignmentType = this.mapAssessmentKind(assessment.kind);
        let assignment: Assignment | null = null;

        if (payload.databaseId) {
          assignment = await this.assignmentModel.findOne({
            where: {
              id: payload.databaseId,
              studentSemesterCourseId,
            },
            transaction,
          });
        }

        if (!assignment) {
          assignment = await this.assignmentModel.findOne({
            where: {
              studentSemesterCourseId,
              description: assessment.title.trim(),
            },
            transaction,
          });
        }

        if (assignment) {
          await assignment.update(
            {
              description: assessment.title.trim(),
              deadline: parsedDate,
              type: assignmentType,
            },
            { transaction }
          );
        } else {
          assignment = await this.assignmentModel.create(
            {
              studentSemesterCourseId,
              description: assessment.title.trim(),
              deadline: parsedDate,
              grade: null,
              status: "not started",
              type: assignmentType,
            },
            { transaction }
          );
          created = true;
        }

        databaseId = assignment.id;
      }

      assessment.dueDate = payload.dueDate;
      assessment.createCalendarItem = true;

      await syllabusRecord.update(
        {
          parsedData,
        },
        { transaction }
      );

      return {
        assessmentId: assessment.id,
        databaseId,
        dueDate: payload.dueDate,
        kind: assessment.kind,
        created,
      };
    });
  }

  private validateUploadedFile(file: UploadedPdfFile): void {
    if (!file) {
      throw new BadRequestException("A PDF file is required");
    }

    const looksLikePdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      throw new BadRequestException("Only PDF files are supported");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("The PDF must be smaller than 10 MB");
    }
  }

  private toEditableSyllabus(data: AiSyllabusData): SyllabusData {
    return {
      sourceLanguage: data.sourceLanguage,
      institution: data.institution,
      faculty: data.faculty,
      course: data.course,
      lecturers: data.lecturers,
      prerequisites: data.prerequisites,
      description: data.description,
      teachingMethod: data.teachingMethod,
      learningOutcomes: data.learningOutcomes,
      policies: data.policies,
      assessments: data.assessments
        .filter(
          (assessment): assessment is typeof assessment & { title: string } =>
            Boolean(assessment.title?.trim())
        )
        .map((assessment, index) => ({
          id: `assessment-${index + 1}`,
          title: assessment.title.trim(),
          kind: assessment.kind,
          weightPercent: assessment.weightPercent,
          submissionMode: assessment.submissionMode,
          groupSize: assessment.groupSize,
          requiredPages: assessment.requiredPages,
          dueDate: assessment.dueDate,
          createCalendarItem: true,
          notes: assessment.notes,
        })),
      topics: data.topics
        .filter((topic): topic is typeof topic & { title: string } =>
          Boolean(topic.title?.trim())
        )
        .map((topic, index) => ({
          id: `topic-${index + 1}`,
          order: topic.order ?? index + 1,
          title: topic.title.trim(),
        })),
      aiPolicy: data.aiPolicy,
      bibliography: data.bibliography,
      notes: data.notes,
    };
  }

  private getMissingFields(
    syllabus: SyllabusData,
    availableDegrees: DegreeOption[]
  ): string[] {
    const missing: string[] = [];

    if (!syllabus.course.title) missing.push("Course title");
    if (availableDegrees.length === 0 && !syllabus.faculty) {
      missing.push("Degree name");
    }
    if (!syllabus.course.code) missing.push("Course code (optional)");
    if (!syllabus.course.credits) missing.push("Credits (optional)");

    const undatedAssessments = syllabus.assessments.filter(
      (assessment) => !assessment.dueDate
    ).length;
    if (undatedAssessments > 0) {
      missing.push(
        `${undatedAssessments} required assessment date${undatedAssessments === 1 ? "" : "s"}`
      );
    }

    return missing;
  }

  private async getAvailableDegrees(
    studentId: string
  ): Promise<DegreeOption[]> {
    const byId = new Map<string, DegreeOption>();

    const directLinks = await this.studentDegreeModel.findAll({
      where: { studentId },
      include: [{ model: Degree, required: true }],
    });

    for (const link of directLinks) {
      byId.set(link.degree.id, {
        id: link.degree.id,
        title: link.degree.title,
      });
    }

    const courseLinks = await this.studentSemesterCourseModel.findAll({
      where: { studentId },
      include: [
        {
          model: SemesterCourse,
          required: true,
          include: [
            {
              association: "course",
              required: true,
              include: [
                {
                  association: "degree",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    for (const link of courseLinks) {
      const degree = link.semesterCourse.course.degree;
      byId.set(degree.id, { id: degree.id, title: degree.title });
    }

    return [...byId.values()].sort((a, b) =>
      a.title.localeCompare(b.title, "he")
    );
  }

  private async resolveDegree(
    studentId: string,
    degreeId: string | null,
    degreeTitle: string | null,
    transaction: Transaction
  ): Promise<Degree> {
    if (degreeId) {
      const allowedDegrees = await this.getAvailableDegrees(studentId);
      if (!allowedDegrees.some((degree) => degree.id === degreeId)) {
        throw new BadRequestException(
          "The selected degree does not belong to this student"
        );
      }

      const degree = await this.degreeModel.findByPk(degreeId, { transaction });
      if (!degree) throw new NotFoundException("Degree not found");
      return degree;
    }

    const normalizedTitle = degreeTitle?.trim();
    if (!normalizedTitle) {
      throw new BadRequestException("A degree name is required");
    }

    const [degree] = await this.degreeModel.findOrCreate({
      where: { title: normalizedTitle },
      defaults: { title: normalizedTitle, type: 1, duration: 3 },
      transaction,
    });

    await this.studentDegreeModel.findOrCreate({
      where: { studentId, degreeId: degree.id },
      defaults: { studentId, degreeId: degree.id },
      transaction,
    });

    return degree;
  }

  private async findOrCreateCourse(
    title: string,
    degreeId: string,
    credits: number | null,
    transaction: Transaction
  ): Promise<{ id: string }> {
    const normalizedTitle = title.trim();
    const normalizedCredits =
      credits !== null && Number.isFinite(Number(credits))
        ? Math.max(0, Number(credits))
        : null;

    /*
     * Course is already registered in SequelizeModule by the application's
     * course/degree modules. Resolving it by model name keeps this service
     * compatible with branches where the Course model file is located
     * elsewhere.
     */
    type CourseRecord = {
      id: string;
      credits: number;
      update: (
        values: { credits: number },
        options: { transaction: Transaction }
      ) => Promise<unknown>;
    };

    const courseModel = (
      this.sequelize as unknown as {
        model: (modelName: string) => {
          findOrCreate: (options: {
            where: { title: string; degreeId: string };
            defaults: {
              title: string;
              degreeId: string;
              credits: number;
            };
            transaction: Transaction;
          }) => Promise<[CourseRecord, boolean]>;
        };
      }
    ).model("Course");

    const [course, created] = await courseModel.findOrCreate({
      where: { title: normalizedTitle, degreeId },
      defaults: {
        title: normalizedTitle,
        degreeId,
        credits: normalizedCredits ?? 0,
      },
      transaction,
    });

    /*
     * The full syllabus is still stored in CourseSyllabus.parsedData, but
     * credits are also copied to Courses.credits so the rest of the app
     * (including Grades) can use them without reading the syllabus JSON.
     *
     * When the course already exists, importing a syllabus with a credits
     * value refreshes the existing Course row as well.
     */
    if (
      !created &&
      normalizedCredits !== null &&
      Number(course.credits) !== normalizedCredits
    ) {
      await course.update({ credits: normalizedCredits }, { transaction });
    }

    return course;
  }

  private async findOrCreateSemester(
    yearNumber: number,
    semesterNumber: number,
    transaction: Transaction
  ): Promise<Semester> {
    const [semester] = await this.semesterModel.findOrCreate({
      where: { yearNumber, semesterNumber },
      defaults: { yearNumber, semesterNumber },
      transaction,
    });
    return semester;
  }

  private async findOrCreateSemesterCourse(
    semesterId: string,
    courseId: string,
    transaction: Transaction
  ): Promise<SemesterCourse> {
    const [semesterCourse] = await this.semesterCourseModel.findOrCreate({
      where: { semesterId, courseId },
      defaults: { semesterId, courseId },
      transaction,
    });
    return semesterCourse;
  }

  private async findOrCreateStudentSemesterCourse(
    studentId: string,
    semesterCourseId: string,
    transaction: Transaction
  ): Promise<StudentSemesterCourse> {
    const [studentSemesterCourse] =
      await this.studentSemesterCourseModel.findOrCreate({
        where: { studentId, semesterCourseId },
        defaults: { studentId, semesterCourseId, grade: null },
        transaction,
      });
    return studentSemesterCourse;
  }

  private async saveSyllabus(
    studentSemesterCourseId: string,
    payload: ConfirmSyllabusRequest,
    transaction: Transaction
  ): Promise<CourseSyllabus> {
    const existing = await this.courseSyllabusModel.findOne({
      where: { studentSemesterCourseId },
      transaction,
    });

    if (existing) {
      await existing.update(
        {
          sourceFileName: payload.sourceFileName,
          parser: payload.parser,
          parsedData: payload.syllabus,
          confirmedAt: new Date(),
        },
        { transaction }
      );
      return existing;
    }

    return this.courseSyllabusModel.create(
      {
        studentSemesterCourseId,
        sourceFileName: payload.sourceFileName,
        parser: payload.parser,
        parsedData: payload.syllabus,
        confirmedAt: new Date(),
      },
      { transaction }
    );
  }

  private parseDateOnly(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T12:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private mapAssessmentKind(
    kind: AssessmentKind
  ): "assignment" | "homework" | "practice" | "project" | "report" | "lab" {
    switch (kind) {
      case "project":
      case "presentation":
        return "project";
      case "lab":
        return "lab";
      case "assignment":
        return "assignment";
      case "participation":
        return "practice";
      case "other":
        return "homework";
      case "exam":
        return "assignment";
    }
  }
}
